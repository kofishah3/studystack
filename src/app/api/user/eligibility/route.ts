import { NextResponse } from "next/server";
import { withAuth, type AuthedRequest } from "@/lib/auth";
import { getUserMetrics } from "@/lib/queries/users";
import { UserID } from "@/types/database";
import { TUTORIAL_ELIGIBILITY } from "@/lib/constants";

async function handler(req: AuthedRequest) {
  const metrics = await getUserMetrics(req.userId as UserID);

  const canCreateTutorial =
    metrics.rating >= TUTORIAL_ELIGIBILITY.MIN_RATING &&
    metrics.engagement >= TUTORIAL_ELIGIBILITY.MIN_ENGAGEMENT;

  return NextResponse.json({
    canCreateTutorial,
    metrics: { rating: metrics.rating, engagement: metrics.engagement },
    required: {
      rating: TUTORIAL_ELIGIBILITY.MIN_RATING,
      engagement: TUTORIAL_ELIGIBILITY.MIN_ENGAGEMENT,
    },
  });
}

export const GET = withAuth(handler);
