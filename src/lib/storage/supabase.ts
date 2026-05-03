import "server-only";
import type { StorageDriver } from "@/lib/storage";

// Stub implementation. Fill in if Supabase Storage is selected as the
// production backend (see plan: open decision pending team leader).
// When wiring getUrl, use:
//   supabase.storage.from(bucket).createSignedUrl(key, expiresIn)
// expiresIn is seconds; the call returns { data: { signedUrl }, error }.
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
