import { withAuth, type AuthedRequest } from "@/lib/auth";
import { notifyContentOwner } from "@/lib/content-activity-notify";
import { NextResponse } from "next/server";
import { q, one } from "@/lib/db";
import {
  asAnswerId,
  asCommentId,
  asQuestionId,
  asTutorialId,
  rowToInteraction,
  type InteractionRow,
} from "@/lib/db-brands";
import { errorToResponse } from "@/lib/errors";

export const POST = withAuth(async (req: AuthedRequest, _ctx: unknown) => {
  try {
    const body = await req.json();
    const { interaction_type, value, target_type, target_id } = body;

    if (!interaction_type || !target_type || target_id === undefined) {
      return NextResponse.json(
        { error: "interaction_type, target_type, and target_id are required" },
        { status: 400 },
      );
    }

    if (!["react", "rating"].includes(interaction_type)) {
      return NextResponse.json(
        { error: "interaction_type must be 'react' or 'rating'" },
        { status: 400 },
      );
    }

    if (!["question", "answer", "comment", "tutorial"].includes(target_type)) {
      return NextResponse.json(
        {
          error:
            "target_type must be one of: question, answer, comment, tutorial",
        },
        { status: 400 },
      );
    }

    const question_id =
      target_type === "question" ? asQuestionId(String(target_id)) : null;
    const answer_id =
      target_type === "answer" ? asAnswerId(Number(target_id)) : null;
    const comment_id =
      target_type === "comment" ? asCommentId(Number(target_id)) : null;
    const tutorial_id =
      target_type === "tutorial" ? asTutorialId(String(target_id)) : null;

    const fkValue =
      target_type === "question"
        ? question_id
        : target_type === "answer"
          ? answer_id
          : target_type === "comment"
            ? comment_id
            : tutorial_id;

    const fkColName =
      target_type === "question"
        ? "question_id"
        : target_type === "answer"
          ? "answer_id"
          : target_type === "comment"
            ? "comment_id"
            : "tutorial_id";

    const targetTable = target_type === "tutorial" ? "tutorials" : target_type + "s";
    const targetRow = await one<{ user_id: string }>(
      `SELECT user_id FROM ${targetTable} WHERE ${fkColName} = $1`,
      [fkValue]
    );

    if (targetRow && targetRow.user_id === req.userId) {
      return NextResponse.json(
        { error: `You cannot ${interaction_type === 'rating' ? 'rate' : 'interact with'} your own ${target_type}` },
        { status: 403 }
      );
    }

    if (value === 0) {
      await q(
        `DELETE FROM interactions WHERE user_id = $1 AND ${fkColName} = $2 AND interaction_type = $3`,
        [req.userId, fkValue, interaction_type],
      );

      try {
        const { getIO } = await import("@/lib/socket");
        const io = getIO();
        if (targetRow?.user_id) {
          io.emit(`user:metrics_update:${targetRow.user_id}`);
        }
        io.emit("leaderboard:update");
      } catch (e) {}

      return NextResponse.json({ success: true, removed: true });
    }

    const row = await one<InteractionRow>(
      `INSERT INTO interactions
         (user_id, interaction_type, value, question_id, answer_id, comment_id, tutorial_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, ${fkColName}, interaction_type)
         WHERE ${fkColName} IS NOT NULL
       DO UPDATE SET
         value = EXCLUDED.value,
         created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        req.userId,
        interaction_type,
        value,
        question_id,
        answer_id,
        comment_id,
        tutorial_id,
      ],
    );

    if (!row) {
      return NextResponse.json(
        { error: "Failed to save interaction" },
        { status: 500 },
      );
    }

    try {
      const { getIO } = await import("@/lib/socket");
      const io = getIO();
      if (targetRow?.user_id) {
        io.emit(`user:metrics_update:${targetRow.user_id}`);
      }
      io.emit("leaderboard:update");
    } catch (e) {}

    notifyContentOwner(targetRow?.user_id, req.userId, "interaction");

    return NextResponse.json(
      { interaction: rowToInteraction(row) },
      { status: 201 },
    );
  } catch (error) {
    return errorToResponse(error);
  }
});

export const GET = withAuth(async (req: AuthedRequest, _ctx: unknown) => {
  try {
    const { searchParams } = new URL(req.url);
    const target_type = searchParams.get("target_type");
    const target_id = searchParams.get("target_id");

    if (!target_type || !target_id) {
      return NextResponse.json(
        { error: "target_type and target_id are required" },
        { status: 400 },
      );
    }

    const fkCol =
      target_type === "question"
        ? "question_id"
        : target_type === "answer"
          ? "answer_id"
          : target_type === "comment"
            ? "comment_id"
            : "tutorial_id";

    const castTargetId =
      target_type === "answer" || target_type === "comment"
        ? Number(target_id)
        : target_id;

    const userRows = await q<InteractionRow>(
      `SELECT * FROM interactions WHERE user_id = $1 AND ${fkCol} = $2`,
      [req.userId, castTargetId],
    );

    const [agg] = await q<{
      upvotes: string;
      downvotes: string;
      rating_count: string;
      avg_rating: string | null;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE interaction_type = 'react' AND value > 0) AS upvotes,
         COUNT(*) FILTER (WHERE interaction_type = 'react' AND value < 0) AS downvotes,
         COUNT(*) FILTER (WHERE interaction_type = 'rating')              AS rating_count,
         AVG(value)  FILTER (WHERE interaction_type = 'rating')           AS avg_rating
       FROM interactions
       WHERE ${fkCol} = $1`,
      [castTargetId],
    );

    return NextResponse.json({
      userInteractions: userRows.map(rowToInteraction),
      userInteraction: userRows[0] ? rowToInteraction(userRows[0]) : null,
      upvotes: Number(agg.upvotes),
      downvotes: Number(agg.downvotes),
      ratingCount: Number(agg.rating_count),
      avgRating: agg.avg_rating !== null ? Number(agg.avg_rating) : null,
    });
  } catch (error) {
    return errorToResponse(error);
  }
});
