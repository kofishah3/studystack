import { withAuth, type AuthedRequest } from "@/lib/auth";
import { listTutorials } from "@/lib/queries/tutorials";
import { listQuestions } from "@/lib/queries/questions";
import { listAnswersByUser } from "@/lib/queries/answers";
import { errorToResponse } from "@/lib/errors";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req: AuthedRequest) => {
  try {
    const sp = req.nextUrl.searchParams;
    const type = sp.get("type") || "Tutorials";
    const page = Math.max(parseInt(sp.get("page") || "1"), 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    let data: any[] = [];

    if (type === "Tutorials") {
      data = await listTutorials(limit, offset, undefined, req.userId);
    } else if (type === "Questions asked") {
      data = await listQuestions(limit, offset, req.userId);
    } else if (type === "Answers given") {
      data = await listAnswersByUser(req.userId, limit, offset);
    }

    return NextResponse.json({ data });
  } catch (error) {
    return errorToResponse(error);
  }
});
