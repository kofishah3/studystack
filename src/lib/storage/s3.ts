import "server-only";
import type { StorageDriver } from "@/lib/storage";

export const s3Storage: StorageDriver = {
  async put() {
    throw new Error("s3 storage not configured");
  },
  async putStream() {
    throw new Error("s3 storage not configured");
  },
  async getUrl() {
    throw new Error("s3 storage not configured");
  },
  async delete() {
    throw new Error("s3 storage not configured");
  },
};
