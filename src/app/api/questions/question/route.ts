import { NextResponse } from 'next/server';
import { computeDemandScore, countSimilarQuestions } from '@/lib/services/demand-score';
import { q } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, userId, popped = false, category = 'general' } = body;  // ← Add category
    
    if (!content || !userId) {
      return NextResponse.json(
        { error: 'Content and userId are required' },
        { status: 400 }
      );
    }
    
    const similarCount = await countSimilarQuestions(content);
    
    const demandScore = computeDemandScore({
      createdAt: new Date(),
      popped: popped,
      similarCount: similarCount
    });
    
    // FIXED: Include category in INSERT
    const result = await q(
      `INSERT INTO questions (content, user_id, popped, demand_score, created_at, category) 
       VALUES ($1, $2, $3, $4, NOW(), $5) 
       RETURNING question_id`,
      [content, userId, popped, demandScore, category]  // ← Added category
    );
    
    return NextResponse.json({
      success: true,
      questionId: result[0]?.question_id,
      demandScore,
      similarCount
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch questions sorted by demand score
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // FIXED: Changed 'id' to 'question_id'
    const questions = await q(
      `SELECT question_id, content, user_id, demand_score, popped, created_at 
       FROM questions 
       ORDER BY demand_score DESC, created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}