import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { StorageDriver } from "@/lib/storage";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

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

  getUrl(key) {
    return `/api/files/${key.split("/").map(encodeURIComponent).join("/")}`;
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
