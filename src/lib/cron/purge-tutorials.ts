import "server-only";
import { q } from "@/lib/db";
import { hardDeleteExpiredTutorials } from "@/lib/queries/tutorials";
import { getStorage } from "@/lib/storage";

export const RETENTION_DAYS = 30;

export type PurgeResult = { deleted: number; files_removed: number };

export async function runTutorialPurge(): Promise<PurgeResult> {
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
    } catch (err) {
      console.error("[purge-tutorials] file delete failed", storage_key, err);
    }
  }

  const deleted = await hardDeleteExpiredTutorials(RETENTION_DAYS);
  return { deleted, files_removed: expiredKeys.length };
}
