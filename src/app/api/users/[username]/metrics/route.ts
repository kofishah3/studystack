import { getUserByUsername, getUserMetrics } from "@/lib/queries/users";
import { errorToResponse } from "@/lib/errors";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await getUserMetrics(user.user_id);

    return NextResponse.json({ data });
  } catch (error) {
    return errorToResponse(error);
  }
}
