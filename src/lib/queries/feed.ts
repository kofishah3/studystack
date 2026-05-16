import { q } from "@/lib/db";
import { listQuestionsForTutorialDetailed } from "./questions-tutorials";
import { asQuestionId, asTutorialId } from "@/lib/db-brands";
import { listAnswersForQuestionDetailed } from "./answers";

import { FeedSettingsState } from "@/components/feed/FeedSettings";

export type FeedItem =
  | { type: "question"; data: any; score: number }
  | { type: "tutorial"; data: any; score: number };

export async function getUnifiedFeed(
  limit: number = 20,
  offset: number = 0,
  settings?: FeedSettingsState,
  userInfo?: { institution?: string; degree_program?: string },
  currentUserId?: string,
): Promise<FeedItem[]> {
  let whereClauses: string[] = ["1=1"];
  const params: any[] = [limit, offset];
  let paramCount = 2;

  if (settings) {
    if (settings.schoolFilter === "mine" && userInfo?.institution) {
      whereClauses.push(`institution = $${++paramCount}`);
      params.push(userInfo.institution);
    }
    if (settings.degreeFilter === "mine" && userInfo?.degree_program) {
      whereClauses.push(`degree_program = $${++paramCount}`);
      params.push(userInfo.degree_program);
    }
    if (settings.timeFilter === "week") {
      whereClauses.push(`created_at >= NOW() - INTERVAL '7 days'`);
    } else if (settings.timeFilter === "month") {
      whereClauses.push(`created_at >= NOW() - INTERVAL '30 days'`);
    }
  }

  const whereStr = whereClauses.join(" AND ");

  let orderBy = "score DESC, created_at DESC";
  if (settings?.sort === "latest") {
    orderBy = "created_at DESC";
  } else if (settings?.sort === "oldest") {
    orderBy = "created_at ASC";
  }

  const sql = `
    WITH ranked_content AS (
      SELECT 
        'question' as item_type,
        q.question_id as id,
        q.demand_score as score,
        q.created_at,
        u.institution,
        u.degree_program
      FROM questions q
      JOIN users u ON q.user_id = u.user_id
      WHERE q.resolved_at IS NULL
      
      UNION ALL
      
      SELECT 
        'tutorial' as item_type,
        t.tutorial_id as id,
        COALESCE(SUM(q.demand_score), 0) as score,
        t.created_at,
        u.institution,
        u.degree_program
      FROM tutorials t
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN questions_tutorials qt ON t.tutorial_id = qt.tutorial_id
      LEFT JOIN questions q ON qt.question_id = q.question_id
      WHERE t.deleted_at IS NULL
      GROUP BY t.tutorial_id, t.created_at, u.institution, u.degree_program
    )
    SELECT * FROM ranked_content
    WHERE ${whereStr}
    ORDER BY ${orderBy}
    LIMIT $1 OFFSET $2
  `;

  const rows = await q<any>(sql, params);
  if (rows.length === 0) return [];

  const questionIds = rows
    .filter((r) => r.item_type === "question")
    .map((r) => r.id);
  const tutorialIds = rows
    .filter((r) => r.item_type === "tutorial")
    .map((r) => r.id);

  const questionsMap: Record<string, any> = {};
  if (questionIds.length > 0) {
    const qData = await q<any>(
      `
      SELECT q.*,
             (SELECT value FROM interactions i WHERE i.question_id = q.question_id AND i.user_id = $2 AND i.interaction_type = 'react') as user_vote
      FROM question_details q 
      WHERE q.question_id = ANY($1)
    `,
      [questionIds, currentUserId],
    );

    const aData = await q<any>(
      `
      SELECT a.*, 
             u.user_name as author_name, 
             u.profile_url as author_profile_url,
             u.institution as author_institution,
             u.degree_program as author_degree_program,
             u.credibility_score as author_credibility_score,
             (SELECT COUNT(*) FROM interactions i WHERE i.answer_id = a.answer_id AND i.interaction_type = 'react' AND i.value > 0) as upvotes,
             (SELECT COUNT(*) FROM interactions i WHERE i.answer_id = a.answer_id AND i.interaction_type = 'react' AND i.value < 0) as downvotes,
             (SELECT value FROM interactions i WHERE i.answer_id = a.answer_id AND i.user_id = $2 AND i.interaction_type = 'react') as user_vote
      FROM answers a
      JOIN users u ON a.user_id = u.user_id
      WHERE a.question_id = ANY($1)
      ORDER BY a.created_at ASC
    `,
      [questionIds, currentUserId],
    );

    const answersByQuestion: Record<string, any[]> = {};
    aData.forEach((ans) => {
      if (!answersByQuestion[ans.question_id])
        answersByQuestion[ans.question_id] = [];

      ans.upvotes = Number(ans.upvotes || 0);
      ans.downvotes = Number(ans.downvotes || 0);
      ans.userVote =
        ans.user_vote === 1 ? "up" : ans.user_vote === -1 ? "down" : null;
      answersByQuestion[ans.question_id].push(ans);
    });

    qData.forEach((qd) => {
      questionsMap[qd.question_id] = {
        ...qd,
        upvotes: Number(qd.upvotes || 0),
        downvotes: Number(qd.downvotes || 0),
        user_vote:
          qd.user_vote === 1 ? "up" : qd.user_vote === -1 ? "down" : null,
        answers: answersByQuestion[qd.question_id] || [],
      };
    });
  }

  const tutorialsMap: Record<string, any> = {};
  if (tutorialIds.length > 0) {
    const tData = await q<any>(
      `
      SELECT ts.*, ts.user_name as author, ts.profile_url as avatarUrl,
             (SELECT value FROM interactions i WHERE i.tutorial_id = ts.tutorial_id AND i.user_id = $2 AND i.interaction_type = 'react') as user_vote
      FROM tutorial_stats ts
      WHERE ts.tutorial_id = ANY($1)
    `,
      [tutorialIds, currentUserId],
    );

    const lqData = await q<any>(
      `
      SELECT qt.tutorial_id, q.question_id, q.title, u.user_name as author_name
      FROM questions_tutorials qt
      JOIN questions q ON qt.question_id = q.question_id
      JOIN users u ON q.user_id = u.user_id
      WHERE qt.tutorial_id = ANY($1)
    `,
      [tutorialIds],
    );

    const lqByTutorial: Record<string, any[]> = {};
    lqData.forEach((lq) => {
      if (!lqByTutorial[lq.tutorial_id]) lqByTutorial[lq.tutorial_id] = [];
      lqByTutorial[lq.tutorial_id].push(lq);
    });

    tData.forEach((td) => {
      tutorialsMap[td.tutorial_id] = {
        ...td,
        id: td.tutorial_id,
        author: td.user_name,
        avatarUrl: td.profile_url,
        createdAt: td.created_at,
        avgRating: Number(td.avg_rating) || 0,
        totalInteractions: Number(td.total_interactions) || 0,
        videoUrl: td.embedded_video_url,
        upvotes: Number(td.upvotes || 0),
        downvotes: Number(td.downvotes || 0),
        user_vote:
          td.user_vote === 1 ? "up" : td.user_vote === -1 ? "down" : null,
        degreeProgram: td.degree_program,
        linkedQuestions: lqByTutorial[td.tutorial_id] || [],
      };
    });
  }

  const results = rows.map((row: any) => {
    if (row.item_type === "question") {
      return {
        type: "question",
        score: Number(row.score),
        data: questionsMap[row.id],
      };
    } else {
      return {
        type: "tutorial",
        score: Number(row.score),
        data: tutorialsMap[row.id],
      };
    }
  });

  return results.filter((r) => r.data) as FeedItem[];
}
