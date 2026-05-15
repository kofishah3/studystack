import { withAuth, type AuthedRequest } from "@/lib/auth";
import { asTutorialId } from "@/lib/db-brands";
import { q } from "@/lib/db";
import { errorToResponse, ForbiddenError, NotFoundError } from "@/lib/errors";
import {
  getTutorialById,
  getTutorialDetailedById,
  softDeleteTutorial,
  updateTutorial,
} from "@/lib/queries/tutorials";
import { listQuestionsForTutorialDetailed } from "@/lib/queries/questions-tutorials";
import { getQuestionByIdDetailed } from "@/lib/queries/questions";
import { listCommentsForTutorialDetailed } from "@/lib/queries/comments";
import { listMaterialsForTutorial } from "@/lib/queries/tutorial-materials";
import { getStorage, DEFAULT_URL_TTL_SECONDS } from "@/lib/storage";
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

    const questionsRaw = await listQuestionsForTutorialDetailed(id);
    const questions = await Promise.all(
      questionsRaw.map(async (q) => {
        const detailed = await getQuestionByIdDetailed(q.question_id);
        return detailed || q;
      }),
    );

    const comments = await listCommentsForTutorialDetailed(id);

    const rawMaterials = await listMaterialsForTutorial(id);
    const storage = getStorage();
    const materials = await Promise.all(
      rawMaterials.map(async (m) => {
        const url = await storage
          .getUrl(m.storage_key, { expiresIn: DEFAULT_URL_TTL_SECONDS })
          .catch(() => null);
        return { ...m, url };
      }),
    );

    let userInteractions: any[] = [];
    const authHeader = _req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const jwt = await import("jsonwebtoken");
        const { JWT_SECRET } = await import("@/lib/auth");
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

        userInteractions = await q(
          `SELECT interaction_type, value FROM interactions WHERE user_id = $1 AND tutorial_id = $2`,
          [payload.userId, id],
        );
      } catch (e) {}
    }

    return NextResponse.json({
      data: {
        ...tutorial,
        upvotes: Number(tutorial.upvotes || 0),
        downvotes: Number(tutorial.downvotes || 0),
        linked_questions: questions,
        comments,
        materials,
        userInteractions,
        userInteraction: userInteractions[0] || null,
      },
    });
  } catch (error) {
    return errorToResponse(error);
  }
}

export const PUT = (req: NextRequest, ctx: RouteCtx) =>
  withAuth(async (authedReq: AuthedRequest, _ctx: RouteCtx) => {
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
  })(req, ctx);

export const DELETE = (req: NextRequest, ctx: RouteCtx) =>
  withAuth(async (authedReq: AuthedRequest, _ctx: RouteCtx) => {
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
  })(req, ctx);
