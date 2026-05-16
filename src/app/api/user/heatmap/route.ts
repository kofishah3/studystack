import { NextResponse } from "next/server";
import { getHeatmapData } from "@/lib/queries/users";
import { withAuth, type AuthedRequest } from "@/lib/auth";

async function getHeatmapHandler(req: AuthedRequest) {
  try {
    const data = await getHeatmapData(req.userId, 90);
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Heatmap API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = withAuth(getHeatmapHandler);
