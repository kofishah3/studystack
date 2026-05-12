import { getUserByUsername } from "@/lib/queries/users";
import { listTutorials } from "@/lib/queries/tutorials";
import { listQuestions } from "@/lib/queries/questions";
import { listAnswersByUser } from "@/lib/queries/answers";
import { errorToResponse } from "@/lib/errors";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "Tutorials";
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    let data: any[] = [];

    if (type === "Tutorials") {
      data = await listTutorials(limit, offset, undefined, user.user_id);
    } else if (type === "Questions asked") {
      data = await listQuestions(limit, offset, user.user_id);
    } else if (type === "Answers given") {
      data = await listAnswersByUser(user.user_id, limit, offset);
    }

    return NextResponse.json({ data });
  } catch (error) {
    return errorToResponse(error);
  }
}
