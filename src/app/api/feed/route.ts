import { NextResponse } from "next/server";
import { getUnifiedFeed } from "@/lib/queries/feed";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth";
import { getUserById } from "@/lib/queries/users";
import { UserID } from "@/types/database";
import { FeedSettingsState } from "@/components/feed/FeedSettings";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10"), 1),
      50,
    );
    const offset = (page - 1) * limit;

    const settings: FeedSettingsState = {
      sort: (searchParams.get("sort") as any) || "demand",
      schoolFilter: (searchParams.get("schoolFilter") as any) || "all",
      degreeFilter: (searchParams.get("degreeFilter") as any) || "all",
      timeFilter: (searchParams.get("timeFilter") as any) || "all",
    };

    const authHeader = request.headers.get("authorization");
    let userInfo = undefined;
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await getUserById(payload.userId as UserID);
        if (user) {
          userInfo = { 
            institution: user.institution || undefined, 
            degree_program: user.degree_program || undefined 
          };
        }
      } catch (e) {
      }
    }

    const items = await getUnifiedFeed(limit, offset, settings, userInfo);

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
