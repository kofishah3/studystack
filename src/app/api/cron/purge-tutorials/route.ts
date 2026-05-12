import { runTutorialPurge } from "@/lib/cron/purge-tutorials";
import { AuthError, errorToResponse } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

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

    const result = await runTutorialPurge();
    return NextResponse.json(result);
  } catch (error) {
    return errorToResponse(error);
  }
}
