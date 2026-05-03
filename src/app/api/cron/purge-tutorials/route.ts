import { q } from "@/lib/db";
import { AuthError, errorToResponse } from "@/lib/errors";
import { hardDeleteExpiredTutorials } from "@/lib/queries/tutorials";
import { getStorage } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

const RETENTION_DAYS = 30;

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      throw new AuthError("CRON_SECRET not configured");
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      throw new AuthError("Unauthorized");
    }

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

    return NextResponse.json({ deleted, files_removed: expiredKeys.length });
  } catch (error) {
    return errorToResponse(error);
  }
}
