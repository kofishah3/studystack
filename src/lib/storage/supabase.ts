import "server-only";
import type { StorageDriver } from "@/lib/storage";

// Stub implementation. Fill in if Supabase Storage is selected as the
// production backend (see plan: open decision pending team leader).
export const supabaseStorage: StorageDriver = {
  async put() {
    throw new Error("supabase storage not configured");
  },
  getUrl() {
    throw new Error("supabase storage not configured");
  },
  async delete() {
    throw new Error("supabase storage not configured");
  },
};
