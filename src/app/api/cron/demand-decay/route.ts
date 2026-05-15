import { runDemandDecay } from "@/lib/cron/demand-decay";
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

    const result = await runDemandDecay();
    
    try {
      const { getIO } = await import("@/lib/socket");
      const io = getIO();
      // Let all feed listeners know demand scores have changed
      io.to("feed").emit("update:demand", { batch: true });
    } catch (e) {
      console.error("Socket emission failed", e);
    }

    return NextResponse.json(result);
  } catch (error) {
    return errorToResponse(error);
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
