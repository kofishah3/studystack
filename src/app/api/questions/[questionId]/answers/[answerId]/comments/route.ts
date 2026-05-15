import { withAuth, type AuthedRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { insertComment } from "@/lib/queries/comments";
import { asAnswerId, asCommentId } from "@/lib/db-brands";
import { errorToResponse } from "@/lib/errors";

export const POST = withAuth(
  async (
    req: AuthedRequest,
    { params }: { params: Promise<{ questionId: string; answerId: string }> },
  ) => {
    try {
      const { answerId: rawAnswerId } = await params;
      const answerId = asAnswerId(Number(rawAnswerId));

      if (isNaN(answerId as number)) {
        return NextResponse.json(
          { error: "Invalid answer ID" },
          { status: 400 },
        );
      }

      const body = await req.json();
      const { content, parent_comment_id } = body;

      if (!content?.trim()) {
        return NextResponse.json(
          { error: "Comment content is required" },
          { status: 400 },
        );
      }

      const comment = await insertComment({
        user_id: req.userId,
        content: content.trim(),
        question_id: null,
        answer_id: answerId,
        tutorial_id: null,
        parent_comment_id: parent_comment_id
          ? asCommentId(Number(parent_comment_id))
          : null,
      });

      try {
        const { questionId } = await params;
        const { getIO } = await import("@/lib/socket");
        const io = getIO();
        io.emit(`user:metrics_update:${req.userId}`);
        io.emit("leaderboard:update");
        io.to(`question:${questionId}`).emit("new:comment");
      } catch (e) {
        console.error("Socket emission failed", e);
      }

      return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
      return errorToResponse(error);
    }
  },
);
