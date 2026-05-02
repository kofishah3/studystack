import { withAuth, type AuthedRequest } from "@/lib/auth";
import { errorToResponse } from "@/lib/errors";
import { asQuestionId } from "@/lib/db-brands";
import { insertTutorial, listTutorials } from "@/lib/queries/tutorials";
import { linkQuestionTutorial } from "@/lib/queries/questions-tutorials";
import {
  createTutorialSchema,
  parseOrThrow,
  validateVideoUrl,
} from "@/lib/validation/tutorial";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const page = Math.max(parseInt(sp.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(parseInt(sp.get("limit") || "20"), 1),
      100,
    );
    const category = sp.get("category") || undefined;
    const offset = (page - 1) * limit;

    const tutorials = await listTutorials(limit, offset, category);

    return NextResponse.json({
      tutorials,
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

    const tutorial = await insertTutorial({
      user_id: req.userId,
      question_id: null,
      title: parsed.title,
      content: parsed.content,
      embedded_video_url: parsed.embedded_video_url ?? null,
    });

    if (parsed.question_ids?.length) {
      for (const qid of parsed.question_ids) {
        await linkQuestionTutorial(asQuestionId(qid), tutorial.tutorial_id);
      }
    }

    return NextResponse.json(
      { tutorial, linked_question_ids: parsed.question_ids ?? [] },
      { status: 201 },
    );
  } catch (error) {
    return errorToResponse(error);
  }
});
