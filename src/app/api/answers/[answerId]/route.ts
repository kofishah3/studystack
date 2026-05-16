import { withAuth, type AuthedRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { insertComment } from "@/lib/queries/comments";
import { deleteAnswer } from "@/lib/queries/answers";
import { asAnswerId, asCommentId } from "@/lib/db-brands";
import { errorToResponse } from "@/lib/errors";

export const POST = withAuth(
  async (
    req: AuthedRequest,
    { params }: { params: Promise<{ answerId: string }> },
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

export const DELETE = withAuth(
  async (
    req: AuthedRequest,
    { params }: { params: Promise<{ answerId: string }> },
  ) => {
    try {
      const { answerId: rawAnswerId } = await params;
      const answerId = parseInt(rawAnswerId);
      
      if (isNaN(answerId)) {
        return NextResponse.json(
          { error: "Invalid answer ID" },
          { status: 400 },
        );
      }
      
      const success = await deleteAnswer(
        asAnswerId(answerId),
        req.userId,
      );
      
      if (!success) {
        return NextResponse.json(
          { error: "Answer not found or you are not authorized to delete it" },
          { status: 403 },
        );
      }
      
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      return errorToResponse(error);
    }
  },
);