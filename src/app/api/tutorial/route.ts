import { withAuth, type AuthedRequest } from "@/lib/auth";
import { withTransaction } from "@/lib/db";
import { errorToResponse, NotFoundError, ValidationError } from "@/lib/errors";
import { asQuestionId, asTutorialId } from "@/lib/db-brands";
import { getQuestionsByIds } from "@/lib/queries/questions";
import {
  linkQuestionTutorial,
  listQuestionsForTutorialDetailed,
} from "@/lib/queries/questions-tutorials";
import {
  createTutorialSchema,
  parseOrThrow,
  validateVideoUrl,
} from "@/lib/validation/tutorial";
import { NextRequest, NextResponse } from "next/server";

import { insertTutorial, listTutorialsDetailed } from "@/lib/queries/tutorials";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const page = Math.max(parseInt(sp.get("page") || "1"), 1);
    const limit = Math.min(Math.max(parseInt(sp.get("limit") || "20"), 1), 100);
    const offset = (page - 1) * limit;

    const tutorials = await listTutorialsDetailed(limit, offset);

    const detailedTutorials = await Promise.all(
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

    return NextResponse.json({
      data: detailedTutorials,
      page,
      limit,
      hasMore: tutorials.length === limit,
    });
  } catch (error) {
    return errorToResponse(error);
  }
}

export const POST = withAuth(async (req: AuthedRequest) => {
  try {
    const body = await req.json();
    const parsed = parseOrThrow(createTutorialSchema, body);

    if (parsed.embedded_video_url) {
      validateVideoUrl(parsed.embedded_video_url);
    }

    const requestedIds = parsed.question_ids.map(asQuestionId);
    const uniqueIds = Array.from(new Set(requestedIds));

    const result = await withTransaction(async (client) => {
      const found = await getQuestionsByIds(uniqueIds, client);
      const foundById = new Map(found.map((q) => [q.question_id, q]));

      for (const qid of uniqueIds) {
        const question = foundById.get(qid);
        if (!question) {
          throw new NotFoundError(`Question not found: ${qid}`);
        }
        if (question.user_id === req.userId) {
          throw new ValidationError(
            "You cannot link a tutorial to your own question",
          );
        }
      }

      const tutorial = await insertTutorial(
        {
          user_id: req.userId,
          title: parsed.title,
          content: parsed.content,
          embedded_video_url: parsed.embedded_video_url ?? null,
        },
        client,
      );

      for (const qid of uniqueIds) {
        await linkQuestionTutorial(qid, tutorial.tutorial_id, client);
      }

      return { tutorial, linked_question_ids: uniqueIds };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorToResponse(error);
  }
});
