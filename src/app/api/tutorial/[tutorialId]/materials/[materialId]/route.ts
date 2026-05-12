import { withAuth, type AuthedRequest } from "@/lib/auth";
import { asTutorialId, asTutorialMaterialId } from "@/lib/db-brands";
import { errorToResponse, ForbiddenError, NotFoundError } from "@/lib/errors";
import {
  deleteMaterial,
  getMaterialById,
} from "@/lib/queries/tutorial-materials";
import { getTutorialById } from "@/lib/queries/tutorials";
import { getStorage } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

type RouteCtx = {
  params: Promise<{ tutorialId: string; materialId: string }>;
};

export const DELETE = (req: NextRequest, ctx: RouteCtx) =>
  withAuth(async (authedReq: AuthedRequest) => {
    try {
      const { tutorialId, materialId } = await ctx.params;
      const tid = asTutorialId(tutorialId);
      const mid = asTutorialMaterialId(materialId);

      const tutorial = await getTutorialById(tid);
      if (!tutorial) throw new NotFoundError("Tutorial not found");
      if (tutorial.user_id !== authedReq.userId) {
        throw new ForbiddenError();
      }

      const material = await getMaterialById(mid);
      if (!material || material.tutorial_id !== tid) {
        throw new NotFoundError("Material not found");
      }

      const removed = await deleteMaterial(mid);
      if (!removed) throw new NotFoundError("Material not found");

      await getStorage()
        .delete(material.storage_key)
        .catch((err) => console.error("[Orphan Cleanup]", err));

      return NextResponse.json({ success: true });
    } catch (error) {
      return errorToResponse(error);
    }
  })(req);
