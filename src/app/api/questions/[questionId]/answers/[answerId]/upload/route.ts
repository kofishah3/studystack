import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthedRequest } from "@/lib/auth";
import { errorToResponse, AuthError, NotFoundError } from "@/lib/errors";
import { getAnswerById } from "@/lib/queries/answers";
import { insertAnswerMaterial } from "@/lib/queries/answer-materials";
import { getStorage, DEFAULT_URL_TTL_SECONDS } from "@/lib/storage";
import { asAnswerId } from "@/lib/db-brands";
import busboy from "busboy";
import { Readable } from "stream";

type RouteCtx = { params: Promise<{ questionId: string; answerId: string }> };

async function streamUploadToStorage(req: NextRequest, answerId: number) {
  const storage = getStorage();
  const bb = busboy({ headers: { "content-type": req.headers.get("content-type") || "" } });

  return new Promise<{ key: string; fileName: string; mime: string; size: number }>((resolve, reject) => {
    let fileFound = false;

    bb.on("file", (name, file, info) => {
      fileFound = true;
      const { filename, mimeType } = info;
      const key = `answers/${answerId}/${Date.now()}-${filename}`;
      let size = 0;

      file.on("data", (chunk) => { size += chunk.length; });

      storage.putStream({ key, stream: file, mimeType: mimeType })
        .then(() => resolve({ key, fileName: filename, mime: mimeType, size }))
        .catch(reject);
    });

    bb.on("error", reject);
    bb.on("finish", () => {
      if (!fileFound) reject(new Error("No file uploaded"));
    });

    const nodeStream = Readable.fromWeb(req.body as any);
    nodeStream.pipe(bb);
  });
}

export const PUT = (req: NextRequest, ctx: RouteCtx) =>
  withAuth(async (authedReq: AuthedRequest) => {
    try {
      const { answerId: rawAnswerId } = await ctx.params;
      const answerId = asAnswerId(parseInt(rawAnswerId));

      const answer = await getAnswerById(answerId);
      if (!answer) throw new NotFoundError("Answer not found");
      if (answer.user_id !== authedReq.userId) {
        throw new AuthError("Forbidden: Only the author can upload files to this answer");
      }

      const upload = await streamUploadToStorage(authedReq, answerId);

      const storage = getStorage();
      const material = await insertAnswerMaterial({
        answer_id: answerId,
        file_name: upload.fileName,
        storage_key: upload.key,
        mime_type: upload.mime,
        size_bytes: upload.size.toString(),
      }).catch(async (err) => {
        await storage.delete(upload.key).catch(e => console.error("[Cleanup Error]", e));
        throw err;
      });

      const url = await storage.getUrl(upload.key, { expiresIn: DEFAULT_URL_TTL_SECONDS });

      return NextResponse.json({
        ...material,
        url,
      }, { status: 201 });
    } catch (error) {
      return errorToResponse(error);
    }
  })(req, ctx);
