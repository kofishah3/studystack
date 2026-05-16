// PATH: src/app/api/comments/[commentId]/route.ts
// NOTE: This is a NEW file. Do NOT modify src/app/api/comments/route.ts.

import { withAuth, type AuthedRequest } from "@/lib/auth";
import {
  getUserNotifyPublicMeta,
  notifyContentOwner,
} from "@/lib/content-activity-notify";
import { one } from "@/lib/db";
import { errorToResponse } from "@/lib/errors";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { insertComment, getCommentById, deleteComment } from "@/lib/queries/comments";
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

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return errorToResponse(error);
  }
});

export const DELETE = withAuth(
  async (
    req: AuthedRequest,
    { params }: { params: Promise<{ commentId: string }> },
  ) => {
    try {
      const { commentId: rawId } = await params;
      const commentId = parseInt(rawId);

      if (isNaN(commentId)) {
        return NextResponse.json(
          { error: "Invalid comment ID" },
          { status: 400 },
        );
      }

      const comment = await getCommentById(asCommentId(commentId));
      if (!comment) throw new NotFoundError("Comment not found");

      if (comment.user_id !== req.userId) {
        throw new ForbiddenError("Only the author can delete this comment");
      }

      const deleted = await deleteComment(asCommentId(commentId), req.userId);
      if (!deleted) throw new NotFoundError("Comment not found or already deleted");

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      return errorToResponse(error);
    }
  },
);