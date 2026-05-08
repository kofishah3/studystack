import { withAuth, type AuthedRequest } from "@/lib/auth";
import { asTutorialId } from "@/lib/db-brands";
import { errorToResponse, ForbiddenError, NotFoundError } from "@/lib/errors";
import {
  getTutorialDetailedById,
  softDeleteTutorial,
  updateTutorial,
} from "@/lib/queries/tutorials";
import {
  listQuestionsForTutorialDetailed,
} from "@/lib/queries/questions-tutorials";
import {
  parseOrThrow,
  updateTutorialSchema,
  validateVideoUrl,
} from "@/lib/validation/tutorial";
import { NextRequest, NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ tutorialId: string }> };

export async function GET(_req: NextRequest, { params }: RouteCtx) {
  try {
    const { tutorialId } = await params;
    const id = asTutorialId(tutorialId);

    const tutorial = await getTutorialDetailedById(id);
    if (!tutorial) throw new NotFoundError("Tutorial not found");

    const questions = await listQuestionsForTutorialDetailed(id);

    return NextResponse.json({
      data: {
        ...tutorial,
        linked_questions: questions,
      },
    });
  } catch (error) {
    return errorToResponse(error);
  }
}

export const PUT = (req: NextRequest, ctx: RouteCtx) =>
  withAuth(async (authedReq: AuthedRequest) => {
    try {
      const { tutorialId } = await ctx.params;
      const id = asTutorialId(tutorialId);

      const existing = await getTutorialById(id);
      if (!existing) throw new NotFoundError("Tutorial not found");
      if (existing.user_id !== authedReq.userId) {
        throw new ForbiddenError();
      }

      const body = await authedReq.json();
      const parsed = parseOrThrow(updateTutorialSchema, body);

      if (parsed.embedded_video_url) {
        validateVideoUrl(parsed.embedded_video_url);
      }

      const updated = await updateTutorial(id, parsed);
      if (!updated) throw new NotFoundError("Tutorial not found");

      return NextResponse.json({ tutorial: updated });
    } catch (error) {
      return errorToResponse(error);
    }
  })(req);

export const DELETE = (req: NextRequest, ctx: RouteCtx) =>
  withAuth(async (authedReq: AuthedRequest) => {
    try {
      const { tutorialId } = await ctx.params;
      const id = asTutorialId(tutorialId);

      const existing = await getTutorialById(id);
      if (!existing) throw new NotFoundError("Tutorial not found");
      if (existing.user_id !== authedReq.userId) {
        throw new ForbiddenError();
      }

      await softDeleteTutorial(id);
      return NextResponse.json({ success: true });
    } catch (error) {
      return errorToResponse(error);
    }
  })(req);
