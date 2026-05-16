import { withAuth, type AuthedRequest } from "@/lib/auth";
import {
  getUserNotifyPublicMeta,
  notifyContentOwner,
} from "@/lib/content-activity-notify";
import { one } from "@/lib/db";
import { errorToResponse } from "@/lib/errors";
import { insertComment } from "@/lib/queries/comments";
import { createCommentSchema, parseOrThrow } from "@/lib/validation/comment";
import { NextResponse } from "next/server";
import {
  asQuestionId,
  asAnswerId,
  asCommentId,
  asTutorialId,
} from "@/lib/db-brands";

export const POST = withAuth(async (req: AuthedRequest, _ctx: unknown) => {
  try {
    const body = await req.json();
    const parsed = parseOrThrow(createCommentSchema, body);

    const comment = await insertComment({
      user_id: req.userId,
      content: parsed.content,
      parent_comment_id: parsed.parent_comment_id
        ? asCommentId(parsed.parent_comment_id)
        : null,
      question_id: parsed.question_id ? asQuestionId(parsed.question_id) : null,
      answer_id: parsed.answer_id ? asAnswerId(parsed.answer_id) : null,
      tutorial_id: parsed.tutorial_id ? asTutorialId(parsed.tutorial_id) : null,
    });

    let contentOwnerId: string | null = null;
    let notifyHref: string | undefined;

    if (parsed.question_id) {
      notifyHref = `/questions/${parsed.question_id}`;
      const row = await one<{ user_id: string }>(
        `SELECT user_id FROM questions WHERE question_id = $1`,
        [parsed.question_id],
      );
      contentOwnerId = row?.user_id ?? null;
    } else if (parsed.answer_id) {
      const row = await one<{ user_id: string; question_id: string }>(
        `SELECT user_id, question_id::text FROM answers WHERE answer_id = $1`,
        [parsed.answer_id],
      );
      contentOwnerId = row?.user_id ?? null;
      if (row?.question_id) notifyHref = `/questions/${row.question_id}`;
    } else if (parsed.tutorial_id) {
      notifyHref = `/tutorials/${parsed.tutorial_id}`;
      const row = await one<{ user_id: string }>(
        `SELECT user_id FROM tutorials WHERE tutorial_id = $1`,
        [parsed.tutorial_id],
      );
      contentOwnerId = row?.user_id ?? null;
    }

    const actorMeta = await getUserNotifyPublicMeta(req.userId);
    notifyContentOwner(contentOwnerId, req.userId, "comment", {
      actorDisplayName: actorMeta?.user_name ?? "Someone",
      actorProfileUrl: actorMeta?.profile_url ?? null,
      href: notifyHref,
    });

    try {
      const { getIO } = await import("@/lib/socket");
      const io = getIO();
      io.emit(`user:metrics_update:${req.userId}`);
      io.emit("leaderboard:update");
      if (parsed.question_id) {
        io.to(`question:${parsed.question_id}`).emit("new:comment");
      }
    } catch (e) {
      console.error("Socket emission failed", e);
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return errorToResponse(error);
  }
});
