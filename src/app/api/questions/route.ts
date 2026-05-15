import { findAndBoostSimilarQuestions, computeDemandScore, countSimilarQuestions } from "@/lib/services/demand-score";
import { withAuth, type AuthedRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export const POST = withAuth(async (req: AuthedRequest) => {
  try {
    const body = await req.json();
    const { title, body: questionBody, category = 'general' } = body;
    
    if (!title) {
      return NextResponse.json(
        { error: 'Question title is required' },
        { status: 400 }
      );
    }
    
    const userId = req.userId;
    
    const similarCount = await countSimilarQuestions(title);
    
    const initialDemandScore = computeDemandScore({
      createdAt: new Date(),
      popped: false,
      similarCount: similarCount
    });
    
    const result = await q(
      `INSERT INTO questions (title, content, user_id, popped, demand_score, created_at, category) 
       VALUES ($1, $2, $3, $4, $5, NOW(), $6) 
       RETURNING question_id`,
      [title, questionBody || null, userId, false, initialDemandScore, category]
    );
    
    const newQuestionId = result[0]?.question_id;
    
    const { similarQuestions, totalBoost } = await findAndBoostSimilarQuestions(
      newQuestionId,
      title,  
      userId
    );
    
    const finalDemandScore = computeDemandScore({
      createdAt: new Date(),
      popped: false,
      similarCount: similarCount,
      boostFromSimilarQuestions: totalBoost
    });
    
    await q(
      `UPDATE questions SET demand_score = $1 WHERE question_id = $2`,
      [finalDemandScore, newQuestionId]
    );
    
    return NextResponse.json({
      success: true,
      questionId: newQuestionId,
      title: title,
      initialDemandScore,
      finalDemandScore,
      similarCount,
      similarQuestionsBoosted: similarQuestions.length,
      boostedQuestions: similarQuestions
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeAnswers = searchParams.get('includeAnswers') === 'true';
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    
    const questions = await q(
      `SELECT 
        q.question_id,
        q.title,
        q.content as body,
        q.demand_score,
        q.popped,
        q.created_at,
        q.category,
        u.user_name,
        u.profile_url,
        u.credibility_score as author_credibility
       FROM questions q
       JOIN users u ON q.user_id = u.user_id
       ORDER BY q.demand_score DESC, q.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    if (includeAnswers && questions.length > 0) {
      const questionIds = questions.map(q => q.question_id);
      
      const answers = await q(
        `SELECT 
          a.answer_id,
          a.content,
          a.created_at,
          a.is_accepted,
          a.media_urls,
          u.user_name as author_name,
          u.credibility_score as author_credibility_score
         FROM answers a
         JOIN users u ON a.user_id = u.user_id
         WHERE a.question_id = ANY($1::uuid[])
         ORDER BY a.created_at ASC`,
        [questionIds]
      );
      
      const answersByQuestion = new Map();
      answers.forEach(answer => {
        if (!answersByQuestion.has(answer.question_id)) {
          answersByQuestion.set(answer.question_id, []);
        }
        answersByQuestion.get(answer.question_id).push(answer);
      });
      
      const questionsWithAnswers = questions.map(q => ({
        ...q,
        answers: answersByQuestion.get(q.question_id) || []
      }));
      
      return NextResponse.json({ data: questionsWithAnswers });
    }
    
    const countResult = await q(`SELECT COUNT(*) as count FROM questions`);
    const total = parseInt(countResult[0]?.count || '0');
    
    return NextResponse.json({
      data: questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
