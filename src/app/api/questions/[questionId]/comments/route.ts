import { withAuth, type AuthedRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { insertComment } from "@/lib/queries/comments";
import { asQuestionId, asCommentId } from "@/lib/db-brands";
import { errorToResponse } from "@/lib/errors";

export const POST = withAuth(
  async (req: AuthedRequest, { params }: { params: Promise<{ questionId: string }> }) => {
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

      return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
      return errorToResponse(error);
    }
  },
);