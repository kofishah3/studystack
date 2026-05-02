import { asQuestionId } from "@/lib/db-brands";
import {
  errorToResponse,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { getQuestionById } from "@/lib/queries/questions";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const queryQuestionId = z.uuid();

export async function GET(request: NextRequest) {
  try {
    const raw = request.nextUrl.searchParams.get("questionId");
    if (!raw) throw new ValidationError("Missing questionId");

    const parsed = queryQuestionId.safeParse(raw);
    if (!parsed.success) throw new ValidationError("Invalid questionId");

    const question = await getQuestionById(asQuestionId(parsed.data));
    if (!question) throw new NotFoundError("Question not found");

    return NextResponse.json({
      question_id: question.question_id,
      content: question.content,
      category: question.category,
      created_at: question.created_at,
    });
  } catch (error) {
    return errorToResponse(error);
  }
}
