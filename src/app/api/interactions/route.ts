import { withAuth, type AuthedRequest } from "@/lib/auth";
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

/**
 * POST /api/interactions
 *
 * Body:
 *  {
 *    interaction_type: "react" | "rating",
 *    value: number,            // +1 upvote / -1 downvote / 0 to remove / rating 1-5
 *    target_type: "question" | "answer" | "comment" | "tutorial",
 *    target_id: string | number
 *  }
 *
 * Behaviour:
 *  - value === 0  → DELETE the existing interaction (toggle off)
 *  - otherwise    → UPSERT (the unique partial indexes ensure one per user per target)
 */


export const POST = withAuth(async (req: AuthedRequest) => {
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
        { error: "target_type must be one of: question, answer, comment, tutorial" },
        { status: 400 },
      );
    }

    // Build the nullable FK columns — exactly one set, rest null (matches CHECK constraint)
    const question_id = target_type === "question" ? asQuestionId(String(target_id)) : null;
    const answer_id   = target_type === "answer"   ? asAnswerId(Number(target_id))   : null;
    const comment_id  = target_type === "comment"  ? asCommentId(Number(target_id))  : null;
    const tutorial_id = target_type === "tutorial" ? asTutorialId(String(target_id)) : null;

    // value === 0 means the user is toggling their reaction off → delete
    if (value === 0) {
      const fkCol =
        target_type === "question" ? "question_id" :
        target_type === "answer"   ? "answer_id"   :
        target_type === "comment"  ? "comment_id"  : "tutorial_id";

      await q(
        `DELETE FROM interactions WHERE user_id = $1 AND ${fkCol} = $2`,
        [req.userId, target_id],
      );

      return NextResponse.json({ success: true, removed: true });
    }

    // UPSERT — ON CONFLICT DO UPDATE lets the user change their vote (e.g. up → down)
    const fkColName =
      target_type === "question" ? "question_id" :
      target_type === "answer"   ? "answer_id"   :
      target_type === "comment"  ? "comment_id"  : "tutorial_id";

    const row = await one<InteractionRow>(
      `INSERT INTO interactions
         (user_id, interaction_type, value, question_id, answer_id, comment_id, tutorial_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, ${fkColName})
         WHERE ${fkColName} IS NOT NULL
       DO UPDATE SET
         value = EXCLUDED.value,
         interaction_type = EXCLUDED.interaction_type,
         created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.userId, interaction_type, value, question_id, answer_id, comment_id, tutorial_id],
    );

    if (!row) {
      return NextResponse.json({ error: "Failed to save interaction" }, { status: 500 });
    }

    return NextResponse.json({ interaction: rowToInteraction(row) }, { status: 201 });
  } catch (error) {
    return errorToResponse(error);
  }
});

/**
 * GET /api/interactions?target_type=answer&target_id=42
 *
 * Returns the current user's interaction on a given target, plus
 * aggregate counts (upvotes / downvotes / rating avg) for that target.
 */
export const GET = withAuth(async (req: AuthedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const target_type = searchParams.get("target_type");
    const target_id   = searchParams.get("target_id");

    if (!target_type || !target_id) {
      return NextResponse.json(
        { error: "target_type and target_id are required" },
        { status: 400 },
      );
    }

    const fkCol =
      target_type === "question" ? "question_id" :
      target_type === "answer"   ? "answer_id"   :
      target_type === "comment"  ? "comment_id"  : "tutorial_id";

    // Current user's vote on this target
    const userRow = await one<InteractionRow>(
      `SELECT * FROM interactions WHERE user_id = $1 AND ${fkCol} = $2`,
      [req.userId, target_id],
    );

    // Aggregate counts for the target
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
      [target_id],
    );

    return NextResponse.json({
      userInteraction: userRow ? rowToInteraction(userRow) : null,
      upvotes:     Number(agg.upvotes),
      downvotes:   Number(agg.downvotes),
      ratingCount: Number(agg.rating_count),
      avgRating:   agg.avg_rating !== null ? Number(agg.avg_rating) : null,
    });
  } catch (error) {
    return errorToResponse(error);
  }
});