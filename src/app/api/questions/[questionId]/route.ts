import { getQuestionByIdDetailed } from "@/lib/queries/questions";
import { listAnswersForQuestionDetailed } from "@/lib/queries/answers";
import {
  listCommentsForQuestionDetailed,
  listCommentsForAnswerDetailed,
} from "@/lib/queries/comments";
import { errorToResponse } from "@/lib/errors";
import { NextResponse } from "next/server";
import { asQuestionId } from "@/lib/db-brands";
import { listMaterialsForQuestion } from "@/lib/queries/question-materials";
import { listMaterialsForAnswer } from "@/lib/queries/answer-materials";
import { getStorage, DEFAULT_URL_TTL_SECONDS } from "@/lib/storage";

export async function GET(
  req: import("next/server").NextRequest,
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

    const storage = getStorage();
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

        const rawAM = await listMaterialsForAnswer(a.answer_id);
        const media_urls = await Promise.all(
          rawAM.map(async (m) => {
            const url = await storage
              .getUrl(m.storage_key, { expiresIn: DEFAULT_URL_TTL_SECONDS })
              .catch(() => null);
            return {
              type: m.mime_type.startsWith("video/") ? "video" : "image",
              url,
            };
          }),
        );

        return {
          ...a,
          comments: answerComments,
          userVote,
          media_urls,
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

    const rawMaterials = await listMaterialsForQuestion(questionId);
    const materials = await Promise.all(
      rawMaterials.map(async (m) => {
        const url = await storage
          .getUrl(m.storage_key, { expiresIn: DEFAULT_URL_TTL_SECONDS })
          .catch(() => null);
        return { ...m, url };
      }),
    );

    return NextResponse.json({
      data: {
        ...question,
        upvotes: Number(question.upvotes || 0),
        downvotes: Number(question.downvotes || 0),
        answers: answersWithComments,
        comments,
        materials,
        user_vote,
      },
    });
  } catch (error) {
    return errorToResponse(error);
  }
}

export const DELETE = (
  req: import("next/server").NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) =>
  import("@/lib/auth").then(({ withAuth }) =>
    withAuth(async (authedReq: any, _ctx: any) => {
      try {
        const { questionId: rawId } = await params;
        const questionId = asQuestionId(rawId);

        const { getQuestionById, deleteQuestion } = await import("@/lib/queries/questions");
        const { ForbiddenError, NotFoundError } = await import("@/lib/errors");

        const question = await getQuestionById(questionId);
        if (!question) throw new NotFoundError("Question not found");

        if (question.user_id !== authedReq.userId) {
          throw new ForbiddenError("Only the author can delete this question");
        }

        await deleteQuestion(questionId);
        return NextResponse.json({ success: true });
      } catch (error) {
        return errorToResponse(error);
      }
    })(req, { params }),
  );
