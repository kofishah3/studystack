import { withAuth, type AuthedRequest } from "@/lib/auth";
import { asTutorialId } from "@/lib/db-brands";
import {
  AuthError,
  errorToResponse,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { insertTutorialMaterial } from "@/lib/queries/tutorial-materials";
import { getTutorialById } from "@/lib/queries/tutorials";
import { DEFAULT_URL_TTL_SECONDS, getStorage } from "@/lib/storage";
import {
  DOCUMENT_MIMES,
  validateMaterialFile,
  validateVideoFile,
  VIDEO_MIMES,
} from "@/lib/validation/tutorial";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ tutorialId: string }> };

function sanitizeFileName(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 200) || "file";
}

export const PUT = (req: NextRequest, ctx: RouteCtx) =>
  withAuth(async (authedReq: AuthedRequest) => {
    try {
      const { tutorialId } = await ctx.params;
      const tid = asTutorialId(tutorialId);

      const tutorial = await getTutorialById(tid);
      if (!tutorial) throw new NotFoundError("Tutorial not found");
      if (tutorial.user_id !== authedReq.userId) {
        throw new AuthError("Forbidden");
      }

      const formData = await authedReq.formData();
      const fileEntry = formData.get("file");
      if (!(fileEntry instanceof File)) {
        throw new ValidationError("Missing 'file' in form data");
      }

      const mime = fileEntry.type || "application/octet-stream";
      const size = fileEntry.size;

      if ((VIDEO_MIMES as readonly string[]).includes(mime)) {
        validateVideoFile(mime, size);
      } else if ((DOCUMENT_MIMES as readonly string[]).includes(mime)) {
        validateMaterialFile(mime, size);
      } else {
        throw new ValidationError(`Unsupported file type: ${mime}`);
      }

      const storage = getStorage();
      const safeName = sanitizeFileName(fileEntry.name);
      const key = `tutorials/${tid}/${randomUUID()}-${safeName}`;
      const buffer = Buffer.from(await fileEntry.arrayBuffer());

      await storage.put({ key, buffer, mimeType: mime });

      const material = await insertTutorialMaterial({
        tutorial_id: tid,
        file_name: fileEntry.name,
        storage_key: key,
        mime_type: mime,
        size_bytes: size,
      }).catch(async (insertErr) => {
        await storage
          .delete(key)
          .catch((cleanupErr) =>
            console.error("[Orphan Cleanup]", cleanupErr),
          );
        throw insertErr;
      });

      const ttl = DEFAULT_URL_TTL_SECONDS;
      const url = await storage.getUrl(key, { expiresIn: ttl });
      const expires_at = new Date(Date.now() + ttl * 1000).toISOString();

      return NextResponse.json(
        {
          ...material,
          url,
          expires_at,
        },
        { status: 201 },
      );
    } catch (error) {
      return errorToResponse(error);
    }
  })(req);
