import { withAuth, type AuthedRequest } from "@/lib/auth";
import { asTutorialId } from "@/lib/db-brands";
import { errorToResponse, ForbiddenError, NotFoundError } from "@/lib/errors";
import { listMaterialsForTutorial } from "@/lib/queries/tutorial-materials";
import { getTutorialById } from "@/lib/queries/tutorials";
import { DEFAULT_URL_TTL_SECONDS, getStorage } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ tutorialId: string }> };

export const GET = withAuth(
  async (authedReq: AuthedRequest, { params }: RouteCtx) => {
    try {
      const { tutorialId } = await params;
      const tid = asTutorialId(tutorialId);

      const tutorial = await getTutorialById(tid);
      if (!tutorial) throw new NotFoundError("Tutorial not found");
      if (tutorial.user_id !== authedReq.userId) {
        throw new ForbiddenError();
      }

      const storage = getStorage();
      const ttl = DEFAULT_URL_TTL_SECONDS;
      const expires_at = new Date(Date.now() + ttl * 1000).toISOString();

      const rows = await listMaterialsForTutorial(tid);
      const materials = await Promise.all(
        rows.map(async (m) => ({
          ...m,
          url: await storage.getUrl(m.storage_key, { expiresIn: ttl }),
          expires_at,
        })),
      );

      return NextResponse.json(
        { materials },
        {
          status: 200,
          headers: { "Cache-Control": `private, max-age=${ttl}` },
        },
      );
    } catch (error) {
      return errorToResponse(error);
    }
  },
);
