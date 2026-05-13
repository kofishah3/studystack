import { getUserByUsername } from "@/lib/queries/users";
import { listTutorialsByUserDetailed } from "@/lib/queries/tutorials";
import { listQuestionsByUserDetailed } from "@/lib/queries/questions";
import { listAnswersByUser } from "@/lib/queries/answers";
import { asTutorialId } from "@/lib/db-brands";
import { listQuestionsForTutorialDetailed } from "@/lib/queries/questions-tutorials";
import { errorToResponse } from "@/lib/errors";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "Tutorials";
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    let data: any[] = [];

    if (type === "Tutorials") {
      const tutorials = await listTutorialsByUserDetailed(
        user.user_id,
        limit,
        offset,
      );
      data = await Promise.all(
        tutorials.map(async (t) => {
          const questions = await listQuestionsForTutorialDetailed(
            asTutorialId(t.tutorial_id),
          );
          return {
            ...t,
            linked_questions: questions,
          };
        }),
      );
    } else if (type === "Questions asked") {
      data = await listQuestionsByUserDetailed(user.user_id, limit, offset);
    } else if (type === "Answers given") {
      data = await listAnswersByUser(user.user_id, limit, offset);
    }

    return NextResponse.json({ data });
  } catch (error) {
    return errorToResponse(error);
  }
}
