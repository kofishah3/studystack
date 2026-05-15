import { withAuth, type AuthedRequest } from "@/lib/auth";
import { asQuestionId } from "@/lib/db-brands";
import {
  AuthError,
  errorToResponse,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { insertQuestionMaterial } from "@/lib/queries/question-materials";
import { getQuestionById } from "@/lib/queries/questions";
import { DEFAULT_URL_TTL_SECONDS, getStorage } from "@/lib/storage";
import {
  DOCUMENT_MIMES,
  MAX_MATERIAL_BYTES,
  MAX_VIDEO_BYTES,
  VIDEO_MIMES,
} from "@/lib/validation/tutorial";
import Busboy from "busboy";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Readable, Transform } from "stream";

type RouteCtx = { params: Promise<{ questionId: string }> };

type UploadResult = {
  key: string;
  mime: string;
  size: number;
  fileName: string;
};

function sanitizeFileName(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 200) || "file";
}

async function streamUploadToStorage(
  req: AuthedRequest,
  qid: ReturnType<typeof asQuestionId>,
): Promise<UploadResult> {
  const ct = req.headers.get("content-type");
  if (!ct || !ct.toLowerCase().includes("multipart/form-data")) {
    throw new ValidationError("Expected multipart/form-data");
  }
  if (!req.body) {
    throw new ValidationError("Missing request body");
  }

  const storage = getStorage();
  const bb = Busboy({
    headers: { "content-type": ct },
    limits: { files: 1, fileSize: MAX_VIDEO_BYTES },
  });

  return new Promise<UploadResult>((resolve, reject) => {
    let handled = false;
    let settled = false;
    const finish = (err?: Error, value?: UploadResult) => {
      if (settled) return;
      settled = true;
      if (err) reject(err);
      else resolve(value as UploadResult);
    };

    bb.on("file", (_name, file, info) => {
      if (handled) {
        file.resume();
        return;
      }
      handled = true;

      const mime = info.mimeType || "application/octet-stream";
      const isVideo = (VIDEO_MIMES as readonly string[]).includes(mime);
      // Questions also use DOCUMENT_MIMES for images (png, jpg etc are in there)
      const isDoc = (DOCUMENT_MIMES as readonly string[]).includes(mime);
      if (!isVideo && !isDoc) {
        file.resume();
        finish(new ValidationError(`Unsupported file type: ${mime}`));
        return;
      }

      const limit = isVideo ? MAX_VIDEO_BYTES : MAX_MATERIAL_BYTES;
      const fileName = info.filename || "file";
      const safeName = sanitizeFileName(fileName);
      const key = `questions/${qid}/${randomUUID()}-${safeName}`;

      let bytes = 0;
      const counter = new Transform({
        transform(chunk, _enc, cb) {
          bytes += chunk.length;
          if (bytes > limit) {
            cb(new ValidationError(`File exceeds size limit (${limit} bytes)`));
            return;
          }
          cb(null, chunk);
        },
      });

      file.on("limit", () => {
        counter.destroy(
          new ValidationError(`File exceeds size limit (${limit} bytes)`),
        );
      });

      file.pipe(counter);

      storage
        .putStream({ key, stream: counter, mimeType: mime })
        .then(() => {
          if (bytes <= 0) {
            storage
              .delete(key)
              .catch((err) => console.error("[Orphan Cleanup]", err));
            finish(new ValidationError("Empty file"));
            return;
          }
          finish(undefined, { key, mime, size: bytes, fileName });
        })
        .catch((err) => {
          storage
            .delete(key)
            .catch((cleanupErr) =>
              console.error("[Orphan Cleanup]", cleanupErr),
            );
          finish(err instanceof Error ? err : new Error(String(err)));
        });
    });

    bb.on("error", (err) =>
      finish(err instanceof Error ? err : new Error(String(err))),
    );
    bb.on("close", () => {
      if (!handled) finish(new ValidationError("Missing 'file' in form data"));
    });

    Readable.fromWeb(req.body as Parameters<typeof Readable.fromWeb>[0])
      .pipe(bb)
      .on("error", (err) =>
        finish(err instanceof Error ? err : new Error(String(err))),
      );
  });
}

export const PUT = withAuth(
  async (authedReq: AuthedRequest, { params }: RouteCtx) => {
    try {
      const { questionId } = await params;
      const qid = asQuestionId(questionId);

      const question = await getQuestionById(qid);
      if (!question) throw new NotFoundError("Question not found");
      if (question.user_id !== authedReq.userId) {
        throw new AuthError("Forbidden");
      }

      const upload = await streamUploadToStorage(authedReq, qid);

      const storage = getStorage();
      const material = await insertQuestionMaterial({
        question_id: qid,
        file_name: upload.fileName,
        storage_key: upload.key,
        mime_type: upload.mime,
        size_bytes: upload.size,
      }).catch(async (insertErr) => {
        await storage
          .delete(upload.key)
          .catch((cleanupErr) =>
            console.error("[Orphan Cleanup]", cleanupErr),
          );
        throw insertErr;
      });

      const ttl = DEFAULT_URL_TTL_SECONDS;
      const url = await storage.getUrl(upload.key, { expiresIn: ttl });
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
  },
);
