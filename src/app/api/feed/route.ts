import { NextResponse } from "next/server";
import { getUnifiedFeed } from "@/lib/queries/feed";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10"), 1),
      50,
    );
    const offset = (page - 1) * limit;

    const items = await getUnifiedFeed(limit, offset);

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        hasMore: items.length === limit,
      },
    });
  } catch (error) {
    console.error("Error in feed API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
