import "server-only";
import type { StorageDriver } from "@/lib/storage";

export const supabaseStorage: StorageDriver = {
  async put() {
    throw new Error("supabase storage not configured");
  },
  async getUrl() {
    throw new Error("supabase storage not configured");
  },
  async delete() {
    throw new Error("supabase storage not configured");
  },
};
