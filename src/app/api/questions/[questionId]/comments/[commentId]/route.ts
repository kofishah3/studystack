// PATH: src/app/api/questions/[questionId]/comments/[commentId]/route.ts  (new file)

/**
 *
 * DELETE /api/questions/:questionId/comments/:commentId
 * — Deletes a question-level comment owned by the authenticated user.
 * — Requires authentication (Bearer token).
 */

import { withAuth, type AuthedRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { deleteComment } from "@/lib/queries/comments";
import { asCommentId } from "@/lib/db-brands";
import { errorToResponse, NotFoundError } from "@/lib/errors";

export const DELETE = withAuth(
  async (
    req: AuthedRequest,
    {
      params,
    }: { params: Promise<{ questionId: string; commentId: string }> },
  ) => {
    try {
      const { commentId: rawCommentId } = await params;
      const commentId = asCommentId(Number(rawCommentId));

      if (isNaN(commentId as number)) {
        return NextResponse.json(
          { error: "Invalid comment ID" },
          { status: 400 },
        );
      }

      const deleted = await deleteComment(commentId, req.userId);

      if (!deleted) {
        throw new NotFoundError("Comment not found or you are not the author");
      }

      return NextResponse.json({ success: true, deleted: commentId });
    } catch (error) {
      return errorToResponse(error);
    }
  },
);