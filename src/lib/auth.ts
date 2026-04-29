import "server-only";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import type { User, UserID } from "@/types/database";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SALT_ROUNDS = 10;

export type AuthedRequest = NextRequest & { userId: UserID };
type RouteHandler = (req: AuthedRequest) => Promise<NextResponse>;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: UserID): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function withAuth(handler: RouteHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);

    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      (req as AuthedRequest).userId = payload.userId as UserID;
      return handler(req as AuthedRequest);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  };
}
