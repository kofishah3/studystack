import { getQuestionByIdDetailed } from "@/lib/queries/questions";
import { listAnswersForQuestionDetailed } from "@/lib/queries/answers";
import {
  listCommentsForQuestionDetailed,
  listCommentsForAnswerDetailed,
} from "@/lib/queries/comments";
import { errorToResponse } from "@/lib/errors";
import { NextResponse } from "next/server";
import { asQuestionId } from "@/lib/db-brands";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ questionId: string }> },
) {
  try {
    const { questionId: rawId } = await params;
    const questionId = asQuestionId(rawId);

    let userId = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const jwt = await import("jsonwebtoken");
        const { JWT_SECRET } = await import("@/lib/auth");
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = payload.userId;
      } catch (e) {
      }
    }

    const question = await getQuestionByIdDetailed(questionId);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    const answers = await listAnswersForQuestionDetailed(questionId);
    const comments = await listCommentsForQuestionDetailed(questionId);

    const answersWithComments = await Promise.all(
      answers.map(async (a) => {
        const answerComments = await listCommentsForAnswerDetailed(a.answer_id);
        
        let userVote = null;
        if (userId) {
          const { one } = await import("@/lib/db");
          const voteRow = await one(
            `SELECT value FROM interactions WHERE user_id = $1 AND answer_id = $2 AND interaction_type = 'react'`,
            [userId, a.answer_id]
          );
          if (voteRow) {
            userVote = voteRow.value === 1 ? "up" : (voteRow.value === -1 ? "down" : null);
          }
        }

        return {
          ...a,
          comments: answerComments,
          userVote,
        };
      }),
    );

    let user_vote = null;
    if (userId) {
      const { one } = await import("@/lib/db");
      const voteRow = await one(
        `SELECT value FROM interactions WHERE user_id = $1 AND question_id = $2 AND interaction_type = 'react'`,
        [userId, questionId]
      );
      if (voteRow) {
        user_vote = voteRow.value === 1 ? "up" : (voteRow.value === -1 ? "down" : null);
      }
    }

    return NextResponse.json({
      data: {
        ...question,
        upvotes: Number(question.upvotes || 0),
        downvotes: Number(question.downvotes || 0),
        answers: answersWithComments,
        comments,
        user_vote,
      },
    });
  } catch (error) {
    return errorToResponse(error);
  }
}
