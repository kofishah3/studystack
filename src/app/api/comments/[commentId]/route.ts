import { withAuth, type AuthedRequest } from "@/lib/auth";
import { errorToResponse } from "@/lib/errors";
import { deleteComment } from "@/lib/queries/comments";
import { NextResponse } from "next/server";
import { asCommentId } from "@/lib/db-brands";

export const DELETE = withAuth(
  async (
    req: AuthedRequest,
    { params }: { params: Promise<{ commentId: string }> },
  ) => {
    try {
      const { commentId } = await params;
      const success = await deleteComment(
        asCommentId(parseInt(commentId)),
        req.userId,
      );
      if (!success) {
        return NextResponse.json(
          { error: "Comment not found or unauthorized" },
          { status: 403 },
        );
      }
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      return errorToResponse(error);
    }
  },
);
