import { q, one } from "../db";  

type DemandScoreInput = {
  createdAt: Date;
  popped: boolean;
  similarCount: number;
};

export function computeDemandScore(input: DemandScoreInput): number {
  const { createdAt, popped, similarCount } = input;
  const hoursElapsed = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  const timeFactor = Math.log(hoursElapsed + 1);
  const repetitionFactor = Math.sqrt(similarCount);
  const unresolvedBoost = popped ? 0.2 : 1;
  const score = unresolvedBoost * (timeFactor + repetitionFactor);
  return Number(score.toFixed(4));
}

// FIXED: Changed 'title' to 'content' in SQL
export async function countSimilarQuestions(content: string): Promise<number> {
  if (!content || content.trim() === '') return 0;
  
  const result = await one<{ count: string }>(
    `SELECT COUNT(*) as count FROM questions WHERE content ILIKE $1`,  // ✅ changed
    [`%${content}%`]
  );
  
  return result ? parseInt(result.count) : 0;
}

// FIXED: Changed 'title' to 'content' in SQL
export async function countSimilarQuestionsAdvanced(content: string): Promise<number> {
  if (!content || content.trim() === '') return 0;
  
  const keywords = content
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !['what', 'how', 'why', 'when', 'where', 'the', 'and', 'for', 'with', 'without'].includes(word));
  
  if (keywords.length === 0) return 0;
  
  const conditions = keywords.map((_, i) => `content ILIKE $${i + 1}`).join(' OR ');  // ✅ changed
  const params = keywords.map(k => `%${k}%`);
  
  const result = await one<{ count: string }>(
    `SELECT COUNT(*) as count FROM questions WHERE ${conditions}`,
    params
  );
  
  return result ? parseInt(result.count) : 0;
}

// FIXED: Changed 'title' to 'content' in SQL
export async function countSimilarQuestionsWithSimilarity(content: string, threshold: number = 0.3): Promise<number> {
  if (!content || content.trim() === '') return 0;
  
  const result = await one<{ count: string }>(
    `SELECT COUNT(*) as count 
     FROM questions 
     WHERE similarity(content, $1) > $2`,  // ✅ changed
    [content, threshold]
  );
  
  return result ? parseInt(result.count) : 0;
}

// FIXED: Changed 'title' to 'content' in SQL
export async function getSimilarQuestions(content: string, limit: number = 10): Promise<Array<{ question_id: number; content: string; similarity: number }>> {
  return q<{ question_id: number; content: string; similarity: number }>(
    `SELECT question_id, content, similarity(content, $1) as similarity
     FROM questions
     WHERE similarity(content, $1) > 0.2
     ORDER BY similarity DESC
     LIMIT $2`,
    [content, limit]
  );
}

// This one is already correct - it uses the fixed functions above
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