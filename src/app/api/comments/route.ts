import { withAuth, type AuthedRequest } from "@/lib/auth";
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

export const POST = withAuth(async (req: AuthedRequest) => {
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

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return errorToResponse(error);
  }
});
