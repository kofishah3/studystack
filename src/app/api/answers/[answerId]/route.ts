import { withAuth, type AuthedRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { insertComment } from "@/lib/queries/comments";
import { asAnswerId, asCommentId } from "@/lib/db-brands";
import { errorToResponse } from "@/lib/errors";

export const POST = withAuth(
  async (
    req: AuthedRequest,
    { params }: { params: Promise<{ questionId: string; answerId: string }> },
  ) => {
    try {
      const { answerId: rawAnswerId } = await params;
      const answerId = asAnswerId(Number(rawAnswerId));

      const body = await req.json();
      const { content, parent_comment_id } = body;

      if (!content?.trim()) {
        return NextResponse.json(
          { error: "Comment content is required" },
          { status: 400 },
        );
      }

      // answer_id set → question_id and tutorial_id must be null (DB CHECK constraint)
      const comment = await insertComment({
        user_id: req.userId,
        content: content.trim(),
        question_id: null,
        answer_id: answerId,
        tutorial_id: null,
        parent_comment_id: parent_comment_id
          ? asCommentId(Number(parent_comment_id))
          : null,
      });

      return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
      return errorToResponse(error);
    }
  },
);