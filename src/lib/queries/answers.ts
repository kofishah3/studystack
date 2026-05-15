// PATH: src/lib/queries/answers.ts  (replace existing file)

import { one, q } from "@/lib/db";
import { asAnswerId, asQuestionId, asUserId } from "@/lib/db-brands";
import { DatabaseError } from "@/lib/errors";
import type { AnswerID, Answers, QuestionID, UserID } from "@/types/database";
import "server-only";

type AnswerRow = Omit<Answers, "answer_id" | "user_id" | "question_id"> & {
  answer_id: number;
  user_id: string;
  question_id: string;
};

function mapAnswer(r: AnswerRow): Answers {
  return {
    ...r,
    answer_id: asAnswerId(r.answer_id),
    user_id: asUserId(r.user_id),
    question_id: asQuestionId(r.question_id),
  };
}

export async function getAnswerById(id: AnswerID): Promise<Answers | null> {
  const row = await one<AnswerRow>(
    "SELECT * FROM answers WHERE answer_id = $1",
    [id],
  );
  return row ? mapAnswer(row) : null;
}

export async function listAnswersForQuestion(
  qid: QuestionID,
): Promise<Answers[]> {
  const rows = await q<AnswerRow>(
    "SELECT * FROM answers WHERE question_id = $1 ORDER BY created_at ASC",
    [qid],
  );
  return rows.map(mapAnswer);
}

export async function insertAnswer(
  user_id: UserID,
  question_id: QuestionID,
  content: string,
): Promise<Answers> {
  // FIX: explicitly pass media_urls so the column is always set;
  // avoids any edge-case where the DB default doesn't fire (e.g. older pg drivers).
  const row = await one<AnswerRow>(
    `INSERT INTO answers (user_id, question_id, content, media_urls, is_accepted)
     VALUES ($1, $2, $3, '[]'::jsonb, false)
     RETURNING *`,
    [user_id, question_id, content],
  );
  if (!row) throw new DatabaseError("insertAnswer: no row returned");
  return mapAnswer(row);
}

export async function acceptAnswer(id: AnswerID): Promise<Answers | null> {
  const row = await one<AnswerRow>(
    "UPDATE answers SET is_accepted = true WHERE answer_id = $1 RETURNING *",
    [id],
  );
  return row ? mapAnswer(row) : null;
}

export async function listAnswersByUser(
  user_id: UserID,
  limit: number,
  offset: number,
): Promise<(Answers & {
    question_content: string;
    question_title: string;
    question_author_name: string;
    upvotes: number;
    downvotes: number;
    comment_count: number;
  })[]> {
  const rows = await q<AnswerRow & {
    question_content: string;
    question_title: string;
    question_author_name: string;
    upvotes: string;
    downvotes: string;
    comment_count: string;
  }>(
    `SELECT a.*, q.content as question_content, q.title as question_title,
            u.user_name as question_author_name,
        (SELECT COUNT(*) FROM interactions i
           WHERE i.answer_id = a.answer_id AND i.interaction_type = 'react' AND i.value > 0) as upvotes,
        (SELECT COUNT(*) FROM interactions i
           WHERE i.answer_id = a.answer_id AND i.interaction_type = 'react' AND i.value < 0) as downvotes,
        (SELECT COUNT(*) FROM comments c WHERE c.answer_id = a.answer_id) as comment_count
     FROM answers a
     JOIN questions q ON a.question_id = q.question_id
     JOIN users u ON q.user_id = u.user_id
     WHERE a.user_id = $3
     ORDER BY a.created_at DESC
     LIMIT $1 OFFSET $2`,
    [Math.min(Math.max(limit, 1), 100), Math.max(offset, 0), user_id],
  );
  return rows.map((r) => ({
    ...mapAnswer(r),
    question_content: r.question_content,
    question_title: r.question_title,
    question_author_name: r.question_author_name,
    upvotes: Number(r.upvotes),
    downvotes: Number(r.downvotes),
    comment_count: Number(r.comment_count),
  }));
}

export async function listAnswersForQuestionDetailed(
  qid: QuestionID,
): Promise<any[]> {
  const rows = await q<any>(
    `SELECT a.*,
            u.user_name             as author_name,
            u.institution           as author_institution,
            u.profile_url           as author_profile_url,
            u.credibility_score     as author_credibility_score
     FROM answers a
     JOIN users u ON a.user_id = u.user_id
     WHERE a.question_id = $1
     ORDER BY a.is_accepted DESC, a.created_at ASC`,
    [qid],
  );
  return rows;
}