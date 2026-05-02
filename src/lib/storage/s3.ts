import "server-only";
import type { StorageDriver } from "@/lib/storage";

// Stub implementation. Fill in if AWS S3 / Cloudflare R2 is selected as
// the production storage backend (see plan: open decision pending team leader).
export const s3Storage: StorageDriver = {
  async put() {
    throw new Error("s3 storage not configured");
  },
  getUrl() {
    throw new Error("s3 storage not configured");
  },
  async delete() {
    throw new Error("s3 storage not configured");
  },
};
