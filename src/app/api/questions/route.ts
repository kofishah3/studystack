import {
  findAndBoostSimilarQuestions,
  computeDemandScore,
  countSimilarQuestions,
} from "@/lib/services/demand-score";
import { withAuth, type AuthedRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { listAnswersForQuestionDetailed } from "@/lib/queries/answers";
import { asQuestionId } from "@/lib/db-brands";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth";
import { getUserById } from "@/lib/queries/users";
import { UserID } from "@/types/database";
import { FeedSettingsState } from "@/components/feed/FeedSettings";
import { listMaterialsForQuestion } from "@/lib/queries/question-materials";
import { listMaterialsForAnswer } from "@/lib/queries/answer-materials";
import { getStorage, DEFAULT_URL_TTL_SECONDS } from "@/lib/storage";

export const POST = withAuth(async (req: AuthedRequest, _ctx: unknown) => {
  try {
    const body = await req.json();
    const { title, body: questionBody, category: rawCategory } = body;
    const category = (rawCategory || "").trim() || "general";

    if (!title) {
      return NextResponse.json(
        { error: "Question title is required" },
        { status: 400 },
      );
    }

    const userId = req.userId;

    const similarCount = await countSimilarQuestions(title);

    const initialDemandScore = computeDemandScore({
      createdAt: new Date(),
      popped: false,
      similarCount: similarCount,
    });

    const result = await q(
      `INSERT INTO questions (title, content, user_id, popped, demand_score, created_at, category) 
       VALUES ($1, $2, $3, $4, $5, NOW(), $6) 
       RETURNING question_id`,
      [title, questionBody || "", userId, false, initialDemandScore, category],
    );

    const newQuestionId = result[0]?.question_id;

    const { similarQuestions, totalBoost } = await findAndBoostSimilarQuestions(
      newQuestionId,
      title,
      userId,
    );

    const finalDemandScore = computeDemandScore({
      createdAt: new Date(),
      popped: false,
      similarCount: similarCount,
      boostFromSimilarQuestions: totalBoost,
    });

    await q(`UPDATE questions SET demand_score = $1 WHERE question_id = $2`, [
      finalDemandScore,
      newQuestionId,
    ]);

    try {
      const { getIO } = await import("@/lib/socket");
      const io = getIO();
      io.emit(`user:metrics_update:${userId}`);
      io.emit("leaderboard:update");
    } catch (e) {
      console.error("Socket emission failed", e);
    }

    return NextResponse.json(
      {
        success: true,
        questionId: newQuestionId,
        title: title,
        initialDemandScore,
        finalDemandScore,
        similarCount,
        similarQuestionsBoosted: similarQuestions.length,
        boostedQuestions: similarQuestions,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const settings: FeedSettingsState = {
      sort: (searchParams.get("sort") as any) || "demand",
      schoolFilter: (searchParams.get("schoolFilter") as any) || "all",
      degreeFilter: (searchParams.get("degreeFilter") as any) || "all",
      timeFilter: (searchParams.get("timeFilter") as any) || "all",
    };

    const authHeader = req.headers.get("authorization");
    let userInfo = undefined;
    let userId = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = payload.userId;
        const user = await getUserById(payload.userId as UserID);
        if (user) {
          userInfo = {
            institution: user.institution || undefined,
            degree_program: user.degree_program || undefined,
          };
        }
      } catch (e) {
        // Ignore
      }
    }

    let query = `
      SELECT 
        q.*,
        (SELECT value FROM interactions i WHERE i.question_id = q.question_id AND i.user_id = $1 AND i.interaction_type = 'react') as user_vote
       FROM question_details q
       WHERE 1=1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    let countQuery = `SELECT COUNT(*) as count FROM questions q JOIN users u ON q.user_id = u.user_id WHERE 1=1`;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (category && category !== "All") {
      query += ` AND q.category ILIKE $${paramIndex}`;
      params.push(`%${category}%`);
      paramIndex++;

      countQuery += ` AND q.category ILIKE $${countParamIndex}`;
      countParams.push(`%${category}%`);
      countParamIndex++;
    }

    if (search && search.trim()) {
      query += ` AND (q.title ILIKE $${paramIndex} OR q.content ILIKE $${paramIndex} OR q.category ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;

      countQuery += ` AND (q.title ILIKE $${countParamIndex} OR q.content ILIKE $${countParamIndex} OR q.category ILIKE $${countParamIndex})`;
      countParams.push(`%${search.trim()}%`);
      countParamIndex++;
    }

    if (settings) {
      if (settings.schoolFilter === "mine" && userInfo?.institution) {
        query += ` AND q.institution = $${paramIndex}`;
        params.push(userInfo.institution);
        paramIndex++;

        countQuery += ` AND u.institution = $${countParamIndex}`;
        countParams.push(userInfo.institution);
        countParamIndex++;
      }
      if (settings.degreeFilter === "mine" && userInfo?.degree_program) {
        query += ` AND q.degree_program = $${paramIndex}`;
        params.push(userInfo.degree_program);
        paramIndex++;

        countQuery += ` AND u.degree_program = $${countParamIndex}`;
        countParams.push(userInfo.degree_program);
        countParamIndex++;
      }
      if (settings.timeFilter === "week") {
        query += ` AND q.created_at >= NOW() - INTERVAL '7 days'`;
        countQuery += ` AND q.created_at >= NOW() - INTERVAL '7 days'`;
      } else if (settings.timeFilter === "month") {
        query += ` AND q.created_at >= NOW() - INTERVAL '30 days'`;
        countQuery += ` AND q.created_at >= NOW() - INTERVAL '30 days'`;
      }
    }

    let orderBy = "q.demand_score DESC, q.created_at DESC";
    if (settings?.sort === "latest") {
      orderBy = "q.created_at DESC";
    } else if (settings?.sort === "oldest") {
      orderBy = "q.created_at ASC";
    }

    query += ` ORDER BY ${orderBy} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const questions = await q(query, params);

    const detailedQuestions = await Promise.all(
      questions.map(async (question: any) => {
        const storage = getStorage();
        const answers = await listAnswersForQuestionDetailed(
          asQuestionId(question.question_id),
        );

        const answersWithMaterials = await Promise.all(
          answers.map(async (ans) => {
            const rawAM = await listMaterialsForAnswer(ans.answer_id);
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
              ...ans,
              upvotes: Number(ans.upvotes || 0),
              downvotes: Number(ans.downvotes || 0),
              media_urls,
            };
          }),
        );

        const materialsRaw = await listMaterialsForQuestion(
          asQuestionId(question.question_id),
        );
        const materials = await Promise.all(
          materialsRaw.map(async (m) => {
            const url = await storage
              .getUrl(m.storage_key, { expiresIn: DEFAULT_URL_TTL_SECONDS })
              .catch(() => null);
            return { ...m, url };
          }),
        );

        return {
          ...question,
          upvotes: Number(question.upvotes || 0),
          downvotes: Number(question.downvotes || 0),
          user_vote:
            question.user_vote === 1
              ? "up"
              : question.user_vote === -1
                ? "down"
                : null,
          answers: answersWithMaterials,
          materials,
        };
      }),
    );

    const countResult = await q(countQuery, countParams);
    const total = parseInt(countResult[0]?.count || "0");

    return NextResponse.json({
      data: detailedQuestions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
