import "server-only";
import { localStorage } from "@/lib/storage/local";
import { s3Storage } from "@/lib/storage/s3";
import { supabaseStorage } from "@/lib/storage/supabase";

export interface StorageDriver {
  put(opts: {
    key: string;
    buffer: Buffer;
    mimeType: string;
  }): Promise<string>;
  getUrl(key: string): string;
  delete(key: string): Promise<void>;
}

export function getStorage(): StorageDriver {
  const backend = (process.env.STORAGE_BACKEND || "local").toLowerCase();
  switch (backend) {
    case "s3":
      return s3Storage;
    case "supabase":
      return supabaseStorage;
    case "local":
    default:
      return localStorage;
  }
}
