import { withAuth, type AuthedRequest } from "@/lib/auth";
import { errorToResponse, ForbiddenError, NotFoundError } from "@/lib/errors";
import { one, withTransaction } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ answerId: string }> };

export const PUT = (req: NextRequest, ctx: RouteCtx) =>
  withAuth(async (authedReq: AuthedRequest, _ctx: RouteCtx) => {
    try {
      const { answerId } = await ctx.params;
      const id = parseInt(answerId, 10);
      
      if (isNaN(id)) {
        return NextResponse.json({ error: "Invalid answer ID" }, { status: 400 });
      }

      const answer = await one<{ answer_id: number; question_id: string }>(
        `SELECT answer_id, question_id FROM answers WHERE answer_id = $1`,
        [id]
      );

      if (!answer) {
        throw new NotFoundError("Answer not found");
      }

      const question = await one<{ user_id: string }>(
        `SELECT user_id FROM questions WHERE question_id = $1`,
        [answer.question_id]
      );

      if (!question) {
        throw new NotFoundError("Question not found");
      }

      if (question.user_id !== authedReq.userId) {
        throw new ForbiddenError("Only the question author can accept an answer");
      }

      await withTransaction(async (client) => {
        await client.query(
          `UPDATE answers SET is_accepted = false WHERE question_id = $1 AND is_accepted = true`,
          [answer.question_id]
        );

        await client.query(
          `UPDATE answers SET is_accepted = true WHERE answer_id = $1`,
          [id]
        );

        await client.query(
          `UPDATE questions SET resolved_at = CURRENT_TIMESTAMP WHERE question_id = $1`,
          [answer.question_id]
        );
      });

      try {
        const { getIO } = await import("@/lib/socket");
        const io = getIO();
        const answerAuthor = await one<{ user_id: string }>(
          `SELECT user_id FROM answers WHERE answer_id = $1`,
          [id]
        );
        if (answerAuthor?.user_id) {
          io.emit(`user:metrics_update:${answerAuthor.user_id}`);
        }
        io.emit("leaderboard:update");
      } catch (e) {
        console.error("Socket emission failed", e);
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      return errorToResponse(error);
    }
  })(req, ctx);
