import { withAuth, type AuthedRequest } from "@/lib/auth";
import { errorToResponse } from "@/lib/errors";
import { deleteComment } from "@/lib/queries/comments";
import { NextResponse } from "next/server";
import { asCommentId } from "@/lib/db-brands";

export const DELETE = withAuth(async (req: AuthedRequest, ctx?: unknown) => {
  const { params } = ctx as { params: { commentId: string } };
  try {
    const success = await deleteComment(asCommentId(parseInt(params.commentId)), req.userId);
    if (!success) {
      return NextResponse.json({ error: "Comment not found or unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return errorToResponse(error);
  }
});
