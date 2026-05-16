import type { q as qFn } from "@/lib/db";
import type { hardDeleteExpiredTutorials as hardDeleteFn } from "@/lib/queries/tutorials";
import type { getStorage as getStorageFn } from "@/lib/storage";

export const RETENTION_DAYS = 30;

export type PurgeResult = { deleted: number; files_removed: number };

export async function runTutorialPurge(): Promise<PurgeResult> {
  const q = require("@/lib/db").q as typeof qFn;
  const hardDeleteExpiredTutorials = require("@/lib/queries/tutorials")
    .hardDeleteExpiredTutorials as typeof hardDeleteFn;
  const getStorage = require("@/lib/storage").getStorage as typeof getStorageFn;

  const expiredKeys = await q<{ storage_key: string }>(
    `SELECT m.storage_key
     FROM tutorial_materials m
     JOIN tutorials t ON t.tutorial_id = m.tutorial_id
     WHERE t.deleted_at IS NOT NULL
       AND t.deleted_at < now() - ($1 || ' days')::interval`,
    [RETENTION_DAYS],
  );

  const storage = getStorage();
  for (const { storage_key } of expiredKeys) {
    try {
      await storage.delete(storage_key);
    } catch (err: any) {
      console.error("[purge-tutorials] file delete failed", storage_key, err);
    }
  }

  const deleted = await hardDeleteExpiredTutorials(RETENTION_DAYS);
  return { deleted, files_removed: expiredKeys.length };
}
