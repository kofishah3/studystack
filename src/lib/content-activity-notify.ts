import "server-only";

import { one } from "@/lib/db";
import { getIO } from "@/lib/socket";
import type { ContentActivityKind, UserID } from "@/types/database";

export type ContentActivityNotifyExtras = {
  actorDisplayName: string;
  actorProfileUrl: string | null;
  /** App-relative path e.g. /questions/foo */
  href?: string;
};

export async function getUserNotifyPublicMeta(userId: string) {
  return one<{ user_name: string; profile_url: string | null }>(
    `SELECT user_name, profile_url FROM users WHERE user_id = $1`,
    [userId],
  );
}

/** Notifies the content owner via their private socket room (skipped if actor is the owner). */
export function notifyContentOwner(
  recipientUserId: UserID | string | null | undefined,
  actorUserId: UserID | string,
  kind: ContentActivityKind,
  extras?: ContentActivityNotifyExtras | null,
) {
  if (!recipientUserId || recipientUserId === actorUserId) return;
  try {
    const io = getIO();
    io.to(`user:${recipientUserId}`).emit("content:activity", {
      kind,
      actorDisplayName: extras?.actorDisplayName,
      actorProfileUrl: extras?.actorProfileUrl ?? null,
      href: extras?.href,
    });
  } catch {
    // Socket not running (e.g. tests or static export)
  }
}
