import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 60;
const WINDOW_MS = 60_000;

export default function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (entry.count >= RATE_LIMIT) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  entry.count++;
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
