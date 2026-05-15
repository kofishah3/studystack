import { NextResponse } from "next/server";
import { getTopContributorsThisWeek } from "@/lib/queries/users";

export async function GET() {
  try {
    const data = await getTopContributorsThisWeek(5);
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
