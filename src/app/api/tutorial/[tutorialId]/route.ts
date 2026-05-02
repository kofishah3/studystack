import { withAuth, type AuthedRequest } from "@/lib/auth";
import { asTutorialId } from "@/lib/db-brands";
import { AuthError, errorToResponse, NotFoundError } from "@/lib/errors";
import { questionsForTutorial } from "@/lib/queries/questions-tutorials";
import {
  getTutorialById,
  softDeleteTutorial,
  updateTutorial,
} from "@/lib/queries/tutorials";
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

    const tutorial = await getTutorialById(id);
    if (!tutorial) throw new NotFoundError("Tutorial not found");

    const links = await questionsForTutorial(id);

    return NextResponse.json({
      tutorial,
      linked_question_ids: links.map((l) => l.question_id),
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
        throw new AuthError("Forbidden");
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
        throw new AuthError("Forbidden");
      }

      await softDeleteTutorial(id);
      return NextResponse.json({ success: true });
    } catch (error) {
      return errorToResponse(error);
    }
  })(req);
