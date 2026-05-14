import { listQuestionsDetailed } from "@/lib/queries/questions";
import { listAnswersForQuestionDetailed } from "@/lib/queries/answers";
import { errorToResponse } from "@/lib/errors";
import { NextResponse } from "next/server";
import { asQuestionId } from "@/lib/db-brands";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const questions = await listQuestionsDetailed(limit, offset, category, search);

    const detailedQuestions = await Promise.all(
      questions.map(async (q) => {
        const answers = await listAnswersForQuestionDetailed(asQuestionId(q.question_id));
        return {
          ...q,
          answers,
        };
      })
    );

    return NextResponse.json({ data: detailedQuestions });
  } catch (error) {
    return errorToResponse(error);
  }
}