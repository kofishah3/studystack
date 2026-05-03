import { withAuth, type AuthedRequest } from "@/lib/auth";
import { asQuestionId, asTutorialId } from "@/lib/db-brands";
import {
  errorToResponse,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import {
  linkQuestionTutorial,
  unlinkQuestionTutorial,
} from "@/lib/queries/questions-tutorials";
import { getQuestionById } from "@/lib/queries/questions";
import { getTutorialById } from "@/lib/queries/tutorials";
import { parseOrThrow } from "@/lib/validation/tutorial";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ tutorialId: string }> };

const bodySchema = z.object({ question_id: z.uuid() });

async function loadOwnedTutorial(tid: string, userId: string) {
  const tutorial = await getTutorialById(asTutorialId(tid));
  if (!tutorial) throw new NotFoundError("Tutorial not found");
  if (tutorial.user_id !== userId) throw new ForbiddenError();
  return tutorial;
}

export const POST = (req: NextRequest, ctx: RouteCtx) =>
  withAuth(async (authedReq: AuthedRequest) => {
    try {
      const { tutorialId } = await ctx.params;
      const tutorial = await loadOwnedTutorial(tutorialId, authedReq.userId);

      const body = await authedReq.json();
      const { question_id } = parseOrThrow(bodySchema, body);

      const qid = asQuestionId(question_id);
      const question = await getQuestionById(qid);
      if (!question) throw new NotFoundError("Question not found");
      if (question.user_id === authedReq.userId) {
        throw new ValidationError(
          "You cannot link a tutorial to your own question",
        );
      }

      const { created } = await linkQuestionTutorial(qid, tutorial.tutorial_id);
      return NextResponse.json({
        linked: true,
        created,
        question_id: qid,
        tutorial_id: tutorial.tutorial_id,
      });
    } catch (error) {
      return errorToResponse(error);
    }
  })(req);

export const DELETE = (req: NextRequest, ctx: RouteCtx) =>
  withAuth(async (authedReq: AuthedRequest) => {
    try {
      const { tutorialId } = await ctx.params;
      const tutorial = await loadOwnedTutorial(tutorialId, authedReq.userId);

      const body = await authedReq.json();
      const { question_id } = parseOrThrow(bodySchema, body);

      const qid = asQuestionId(question_id);
      const question = await getQuestionById(qid);
      if (!question) throw new NotFoundError("Question not found");

      const removed = await unlinkQuestionTutorial(qid, tutorial.tutorial_id);
      return NextResponse.json({
        unlinked: removed.length > 0,
        question_id: qid,
        tutorial_id: tutorial.tutorial_id,
      });
    } catch (error) {
      return errorToResponse(error);
    }
  })(req);
