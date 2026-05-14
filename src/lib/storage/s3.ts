import type { StorageDriver } from "@/lib/storage";
import { DatabaseError } from "@/lib/errors";

export const s3Storage: StorageDriver = {
  async put() {
    throw new DatabaseError("S3 storage not configured");
  },
  async putStream() {
    throw new DatabaseError("S3 storage not configured");
  },
  async getUrl() {
    throw new DatabaseError("S3 storage not configured");
  },
  async delete() {
    throw new DatabaseError("S3 storage not configured");
  },
};
