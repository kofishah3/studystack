import { q } from "@/lib/db";
import { listQuestionsForTutorialDetailed } from "./questions-tutorials";
import { asQuestionId, asTutorialId } from "@/lib/db-brands";
import { listAnswersForQuestionDetailed } from "./answers";

export type FeedItem =
  | { type: "question"; data: any; score: number }
  | { type: "tutorial"; data: any; score: number };

export async function getUnifiedFeed(
  limit: number = 20,
  offset: number = 0,
): Promise<FeedItem[]> {
  const sql = `
    WITH ranked_content AS (
      -- Questions ranked by demand_score
      SELECT 
        'question' as item_type,
        q.question_id as id,
        q.demand_score as score,
        q.created_at
      FROM questions q
      WHERE q.resolved_at IS NULL
      
      UNION ALL
      
      -- Tutorials ranked by SUM of demand_score of linked questions
      SELECT 
        'tutorial' as item_type,
        t.tutorial_id as id,
        COALESCE(SUM(q.demand_score), 0) as score,
        t.created_at
      FROM tutorials t
      LEFT JOIN questions_tutorials qt ON t.tutorial_id = qt.tutorial_id
      LEFT JOIN questions q ON qt.question_id = q.question_id
      WHERE t.deleted_at IS NULL
      GROUP BY t.tutorial_id
    )
    SELECT * FROM ranked_content
    ORDER BY score DESC, created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const rows = await q<any>(sql, [limit, offset]);

  const results = await Promise.all(
    rows.map(async (row: any) => {
      if (row.item_type === "question") {
        const qData = await q(
          `
        SELECT q.*, u.user_name, u.profile_url
        FROM questions q 
        JOIN users u ON q.user_id = u.user_id 
        WHERE q.question_id = $1
      `,
          [row.id],
        );

        const answers = await listAnswersForQuestionDetailed(
          asQuestionId(row.id),
        );

        return {
          type: "question",
          score: Number(row.score),
          data: {
            ...qData[0],
            answers: answers,
          },
        };
      } else {
        const tData = await q(
          `
        SELECT t.*, u.user_name as author, u.profile_url as avatarUrl
        FROM tutorials t
        JOIN users u ON t.user_id = u.user_id
        WHERE t.tutorial_id = $1
      `,
          [row.id],
        );

        const linkedQuestions = await listQuestionsForTutorialDetailed(
          asTutorialId(row.id),
        );

        return {
          type: "tutorial",
          score: Number(row.score),
          data: {
            ...tData[0],
            id: tData[0].tutorial_id,
            linkedQuestions: linkedQuestions.map((lq) => ({
              question_id: lq.question_id,
              title: lq.title,
              author_name: lq.author_name,
            })),
          },
        };
      }
    }),
  );

  return results as FeedItem[];
}
