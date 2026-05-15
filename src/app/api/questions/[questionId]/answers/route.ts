// PATH: src/app/api/questions/[questionId]/answers/route.ts

import { withAuth, type AuthedRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { insertAnswer, listAnswersForQuestionDetailed } from "@/lib/queries/answers";
import { asQuestionId } from "@/lib/db-brands";
import { errorToResponse } from "@/lib/errors";
import { one } from "@/lib/db";

export const POST = withAuth(
  async (
    req: AuthedRequest,
    { params }: { params: Promise<{ questionId: string }> },
  ) => {
    try {
      const { questionId: rawId } = await params;
      const questionId = asQuestionId(rawId);

      const body = await req.json();
      const { content } = body;

      if (!content?.trim()) {
        return NextResponse.json(
          { error: "Answer content is required" },
          { status: 400 },
        );
      }

      const answer = await insertAnswer(req.userId, questionId, content.trim());

      // Enrich with author fields so AnswerCard receives the full shape.
      // We do a single targeted lookup — no need to re-fetch all answers.
      const enriched = await one<{
        author_name: string;
        author_profile_url: string | null;
        author_credibility_score: number;
      }>(
        `SELECT u.user_name         AS author_name,
                u.profile_url       AS author_profile_url,
                u.credibility_score AS author_credibility_score
         FROM users u
         WHERE u.user_id = $1`,
        [req.userId],
      );

      try {
        const { getIO } = await import("@/lib/socket");
        const io = getIO();
        io.emit(`user:metrics_update:${req.userId}`);
        io.emit("leaderboard:update");
        io.to(`question:${questionId}`).emit("new:answer");
      } catch (e) {
        console.error("Socket emission failed", e);
      }

      return NextResponse.json(
        {
          answer: {
            ...answer,
            author_name: enriched?.author_name ?? "Unknown",
            author_profile_url: enriched?.author_profile_url ?? null,
            author_credibility_score: enriched?.author_credibility_score ?? 0,
            comments: [],
            userVote: null,
          },
        },
        { status: 201 },
      );
    } catch (error) {
      return errorToResponse(error);
    }
  },
);