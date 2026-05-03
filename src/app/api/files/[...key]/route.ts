import { AuthError, errorToResponse, NotFoundError } from "@/lib/errors";
import { readLocalFile, verifyFileToken } from "@/lib/storage/local";
import { NextRequest, NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ key: string[] }> };

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export async function GET(req: NextRequest, { params }: RouteCtx) {
  try {
    const { key } = await params;
    const joined = key.map(decodeURIComponent).join("/");

    const token = new URL(req.url).searchParams.get("token");
    if (!token) throw new AuthError("Missing file URL token");
    verifyFileToken(joined, token);

    const result = await readLocalFile(joined);
    if (!result) throw new NotFoundError("File not found");

    const ext = joined.split(".").pop()?.toLowerCase() ?? "";
    const mime = MIME_BY_EXT[ext] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Length": String(result.size),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return errorToResponse(error);
  }
}
