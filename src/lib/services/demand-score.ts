import { q, one } from "../db";
import { parseQuestion, calculateSimilarityScore, type ParsedQuestion } from "./question-parser";

type DemandScoreInput = {
  createdAt: Date;
  popped: boolean;
  similarCount: number;
  boostFromSimilarQuestions?: number; // New: boost from related questions
};

export function computeDemandScore(input: DemandScoreInput): number {
  const { createdAt, popped, similarCount, boostFromSimilarQuestions = 0 } = input;
  const hoursElapsed = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
  const timeFactor = Math.log(hoursElapsed + 1);
  const repetitionFactor = Math.sqrt(similarCount);
  const unresolvedBoost = popped ? 0.2 : 1;
  
  // Add boost from similar questions (max 20 points)
  const similarBoost = Math.min(boostFromSimilarQuestions, 20);
  
  const score = (unresolvedBoost * (timeFactor + repetitionFactor)) + similarBoost;
  return Number(score.toFixed(4));
}

export async function findAndBoostSimilarQuestions(
  newQuestionId: number,
  title: string, 
  userId: string
): Promise<{ similarQuestions: any[]; totalBoost: number }> {
  const parsedNew = parseQuestion(title);  // Use title
  
  // Get all existing questions
  const existingQuestions = await q(
    `SELECT question_id, title, demand_score, user_id 
     FROM questions 
     WHERE question_id != $1`,
    [newQuestionId]
  );
  
  const similarQuestions = [];
  let totalBoost = 0;
  
  for (const existing of existingQuestions) {
    const parsedExisting = parseQuestion(existing.title);  // Use title
    const similarityScore = calculateSimilarityScore(parsedNew, parsedExisting);
    
    if (similarityScore > 0) {
      similarQuestions.push({
        question_id: existing.question_id,
        similarity_score: similarityScore,
        current_demand_score: existing.demand_score
      });
      
      totalBoost += similarityScore;
      
      // Convert to number before arithmetic
      const currentScore = Number(existing.demand_score);
      const newDemandScore = currentScore + (similarityScore / 10);
      
      await q(
        `UPDATE questions SET demand_score = $1 WHERE question_id = $2`,
        [newDemandScore, existing.question_id]
      );
    }
  }
  
  return { similarQuestions, totalBoost };
}

// Original similarity count (keep for basic matching)
export async function countSimilarQuestions(content: string): Promise<number> {
  if (!content || content.trim() === '') return 0;
  
  const result = await one<{ count: string }>(
    `SELECT COUNT(*) as count FROM questions WHERE content ILIKE $1`,
    [`%${content}%`]
  );
  
  return result ? parseInt(result.count) : 0;
}

// Advanced similarity with keyword extraction
export async function countSimilarQuestionsAdvanced(content: string): Promise<number> {
  if (!content || content.trim() === '') return 0;
  
  const keywords = content
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !['what', 'how', 'why', 'when', 'where', 'the', 'and', 'for', 'with', 'without'].includes(word));
  
  if (keywords.length === 0) return 0;
  
  const conditions = keywords.map((_, i) => `content ILIKE $${i + 1}`).join(' OR ');
  const params = keywords.map(k => `%${k}%`);
  
  const result = await one<{ count: string }>(
    `SELECT COUNT(*) as count FROM questions WHERE ${conditions}`,
    params
  );
  
  return result ? parseInt(result.count) : 0;
}

export async function getDemandScoreForQuestion(
  questionId: number,
  content: string,
  createdAt: Date,
  popped: boolean
): Promise<number> {
  const similarCount = await countSimilarQuestionsAdvanced(content);
  const adjustedCount = Math.max(0, similarCount - 1);
  const score = computeDemandScore({
    createdAt,
    popped,
    similarCount: adjustedCount
  });
  
  await q(
    `UPDATE questions SET demand_score = $1 WHERE question_id = $2`,
    [score, questionId]
  );
  
  return score;
}