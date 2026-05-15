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

export const POST = withAuth(async (req: AuthedRequest) => {
  try {
    const body = await req.json();
    const { title, body: questionBody, category = "general" } = body;

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
      [
        title,
        questionBody || null,
        userId,
        false,
        initialDemandScore,
        category,
      ],
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

    let query = `
      SELECT 
        q.question_id,
        q.title,
        q.content,
        q.demand_score,
        q.popped,
        q.created_at,
        q.category,
        u.user_name,
        u.profile_url,
        u.credibility_score as author_credibility
       FROM questions q
       JOIN users u ON q.user_id = u.user_id
       WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    let countQuery = `SELECT COUNT(*) as count FROM questions q WHERE 1=1`;
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
      query += ` AND (q.title ILIKE $${paramIndex} OR q.content ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;

      countQuery += ` AND (q.title ILIKE $${countParamIndex} OR q.content ILIKE $${countParamIndex})`;
      countParams.push(`%${search.trim()}%`);
      countParamIndex++;
    }

    query += ` ORDER BY q.demand_score DESC, q.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const questions = await q(query, params);

    const detailedQuestions = await Promise.all(
      questions.map(async (question: any) => {
        const answers = await listAnswersForQuestionDetailed(
          asQuestionId(question.question_id),
        );
        return {
          ...question,
          answers,
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
