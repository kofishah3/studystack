// PATH: src/app/api/questions/[questionId]/answers/route.ts  (new file)

/**
 *
 * POST /api/questions/:questionId/answers
 * — Creates a new answer for the given question.
 * — Requires authentication (Bearer token).
 */

import { withAuth, type AuthedRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { insertAnswer } from "@/lib/queries/answers";
import { listCommentsForAnswerDetailed } from "@/lib/queries/comments";
import { asQuestionId } from "@/lib/db-brands";
import { errorToResponse } from "@/lib/errors";

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

      // Return the answer enriched with an empty comments array so the
      // AnswerCard component receives the shape it expects immediately.
      return NextResponse.json(
        {
          answer: {
            ...answer,
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