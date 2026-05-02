import { ValidationError } from "@/lib/errors";
import { z } from "zod";

export const DOCUMENT_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

export const VIDEO_MIMES = ["video/mp4", "video/webm", "video/ogg"] as const;

export const ALLOWED_VIDEO_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "www.vimeo.com",
  "player.vimeo.com",
  "loom.com",
  "www.loom.com",
] as const;

export const MAX_MATERIAL_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

export const createTutorialSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  embedded_video_url: z.string().url().nullable().optional(),
  question_ids: z.array(z.string().uuid()).optional(),
});

export const updateTutorialSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    content: z.string().min(1).optional(),
    embedded_video_url: z.string().url().nullable().optional(),
  })
  .strict();

export function validateVideoUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ValidationError("Invalid video URL");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new ValidationError("Video URL must use http(s)");
  }
  const host = parsed.hostname.toLowerCase();
  const allowed = (ALLOWED_VIDEO_HOSTS as readonly string[]).some(
    (h) => host === h || host.endsWith(`.${h}`),
  );
  if (!allowed) {
    throw new ValidationError(
      `Video host not allowed. Allowed: ${ALLOWED_VIDEO_HOSTS.join(", ")}`,
    );
  }
}

export function validateMaterialFile(mime: string, sizeBytes: number): void {
  if (!(DOCUMENT_MIMES as readonly string[]).includes(mime)) {
    throw new ValidationError(`Unsupported material MIME type: ${mime}`);
  }
  if (sizeBytes <= 0 || sizeBytes > MAX_MATERIAL_BYTES) {
    throw new ValidationError(
      `Material exceeds ${MAX_MATERIAL_BYTES} bytes or is empty`,
    );
  }
}

export function validateVideoFile(mime: string, sizeBytes: number): void {
  if (!(VIDEO_MIMES as readonly string[]).includes(mime)) {
    throw new ValidationError(`Unsupported video MIME type: ${mime}`);
  }
  if (sizeBytes <= 0 || sizeBytes > MAX_VIDEO_BYTES) {
    throw new ValidationError(
      `Video exceeds ${MAX_VIDEO_BYTES} bytes or is empty`,
    );
  }
}
