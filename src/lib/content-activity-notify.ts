import "server-only";

import { getIO } from "@/lib/socket";
import type { ContentActivityKind, UserID } from "@/types/database";

/** Notifies the content owner via their private socket room (skipped if actor is the owner). */
export function notifyContentOwner(
  recipientUserId: UserID | string | null | undefined,
  actorUserId: UserID | string,
  kind: ContentActivityKind,
) {
  if (!recipientUserId || recipientUserId === actorUserId) return;
  try {
    const io = getIO();
    io.to(`user:${recipientUserId}`).emit("content:activity", { kind });
  } catch {
    // Socket not running (e.g. tests or static export)
  }
}
