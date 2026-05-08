import { AuthedRequest, withAuth } from "@/lib/auth";
import { errorToResponse } from "@/lib/errors";
import { getUserMetrics } from "@/lib/queries/users";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req: AuthedRequest) => {
  try {
    let data = await getUserMetrics(req.userId);

    return NextResponse.json({ data });
  } catch (error) {
    return errorToResponse(error);
  }
});
