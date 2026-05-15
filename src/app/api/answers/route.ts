import { withAuth, type AuthedRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { insertAnswer } from "@/lib/queries/answers";
import { asQuestionId } from "@/lib/db-brands";
import { errorToResponse } from "@/lib/errors";

export const POST = withAuth(
  async (req: AuthedRequest, { params }: { params: Promise<{ questionId: string }> }) => {
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

      return NextResponse.json({ answer }, { status: 201 });
    } catch (error) {
      return errorToResponse(error);
    }
  },
);