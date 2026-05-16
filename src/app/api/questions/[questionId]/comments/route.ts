// PATH: src/app/api/questions/[questionId]/comments/route.ts  (new file)

/**
 *
 * POST /api/questions/:questionId/comments
 * — Creates a question-level comment (or threaded reply via parent_comment_id).
 * — Requires authentication (Bearer token).
 */

import { withAuth, type AuthedRequest } from "@/lib/auth";
import {
  getUserNotifyPublicMeta,
  notifyContentOwner,
} from "@/lib/content-activity-notify";
import { one } from "@/lib/db";
import { NextResponse } from "next/server";
import { insertComment } from "@/lib/queries/comments";
import { asQuestionId, asCommentId } from "@/lib/db-brands";
import { errorToResponse } from "@/lib/errors";

export const POST = withAuth(
  async (
    req: AuthedRequest,
    { params }: { params: Promise<{ questionId: string }> },
  ) => {
    try {
      const { questionId: rawId } = await params;
      const questionId = asQuestionId(rawId);

      const body = await req.json();
      const { content, parent_comment_id } = body;

      if (!content?.trim()) {
        return NextResponse.json(
          { error: "Comment content is required" },
          { status: 400 },
        );
      }

      // question_id set → answer_id and tutorial_id must be null (DB CHECK constraint)
      const comment = await insertComment({
        user_id: req.userId,
        content: content.trim(),
        question_id: questionId,
        answer_id: null,
        tutorial_id: null,
        parent_comment_id: parent_comment_id
          ? asCommentId(Number(parent_comment_id))
          : null,
      });

      const owner = await one<{ user_id: string }>(
        `SELECT user_id FROM questions WHERE question_id = $1`,
        [questionId],
      );
      const actorMeta = await getUserNotifyPublicMeta(req.userId);
      notifyContentOwner(owner?.user_id, req.userId, "comment", {
        actorDisplayName: actorMeta?.user_name ?? "Someone",
        actorProfileUrl: actorMeta?.profile_url ?? null,
        href: `/questions/${questionId}`,
      });

      try {
        const { getIO } = await import("@/lib/socket");
        const io = getIO();
        io.emit(`user:metrics_update:${req.userId}`);
        io.emit("leaderboard:update");
        io.to(`question:${questionId}`).emit("new:comment");
      } catch (e) {
        console.error("Socket emission failed", e);
      }

      return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
      return errorToResponse(error);
    }
  },
);