// PATH: src/app/api/comments/[commentId]/route.ts
// NOTE: This is a NEW file. Do NOT modify src/app/api/comments/route.ts.

import { withAuth, type AuthedRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getCommentById, deleteComment } from "@/lib/queries/comments";
import { asCommentId } from "@/lib/db-brands";
import { errorToResponse, ForbiddenError, NotFoundError } from "@/lib/errors";

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