import "server-only";
import { createWriteStream, promises as fs } from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth";
import { AuthError } from "@/lib/errors";
import {
  DEFAULT_URL_TTL_SECONDS,
  type StorageDriver,
} from "@/lib/storage";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

export function signFileToken(key: string, expiresIn: number): string {
  return jwt.sign({ k: key }, JWT_SECRET, { expiresIn });
}

export function verifyFileToken(key: string, token: string): void {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { k?: string };
    if (payload.k !== key) {
      throw new AuthError("Invalid or expired file URL");
    }
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError("Invalid or expired file URL");
  }
}

function resolveSafe(key: string): string {
  const target = path.resolve(UPLOADS_ROOT, key);
  const root = path.resolve(UPLOADS_ROOT);
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw new Error("Invalid storage key (path traversal)");
  }
  return target;
}

export const localStorage: StorageDriver = {
  async put({ key, buffer }) {
    const target = resolveSafe(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, buffer);
    return key;
  },

  async putStream({ key, stream }) {
    const target = resolveSafe(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    try {
      await pipeline(stream, createWriteStream(target));
    } catch (err) {
      await fs.rm(target, { force: true }).catch((cleanupErr) =>
        console.error("[Orphan Cleanup]", cleanupErr)
      );
      throw err;
    }
    return key;
  },

  async getUrl(key, opts) {
    const expiresIn = opts?.expiresIn ?? DEFAULT_URL_TTL_SECONDS;
    const token = signFileToken(key, expiresIn);
    const encodedPath = key.split("/").map(encodeURIComponent).join("/");
    return `/api/files/${encodedPath}?token=${encodeURIComponent(token)}`;
  },

  async delete(key) {
    const target = resolveSafe(key);
    await fs.rm(target, { force: true });
  },
};

export async function readLocalFile(
  key: string,
): Promise<{ buffer: Buffer; size: number } | null> {
  const target = resolveSafe(key);
  try {
    const buffer = await fs.readFile(target);
    return { buffer, size: buffer.byteLength };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}
