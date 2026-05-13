import { getQuestionByIdDetailed } from "@/lib/queries/questions";
import { listAnswersForQuestionDetailed } from "@/lib/queries/answers";
import {
  listCommentsForQuestionDetailed,
  listCommentsForAnswerDetailed,
} from "@/lib/queries/comments";
import { errorToResponse } from "@/lib/errors";
import { NextResponse } from "next/server";
import { asQuestionId } from "@/lib/db-brands";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ questionId: string }> },
) {
  try {
    const { questionId: rawId } = await params;
    const questionId = asQuestionId(rawId);
    const question = await getQuestionByIdDetailed(questionId);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    const answers = await listAnswersForQuestionDetailed(questionId);
    const comments = await listCommentsForQuestionDetailed(questionId);

    const answersWithComments = await Promise.all(
      answers.map(async (a) => {
        const answerComments = await listCommentsForAnswerDetailed(a.answer_id);
        return {
          ...a,
          comments: answerComments,
        };
      }),
    );

    return NextResponse.json({
      data: {
        ...question,
        answers: answersWithComments,
        comments,
      },
    });
  } catch (error) {
    return errorToResponse(error);
  }
}
