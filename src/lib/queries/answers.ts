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
  const row = await one<AnswerRow>(
    `INSERT INTO answers (user_id, question_id, content, is_accepted)
     VALUES ($1, $2, $3, false)
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
): Promise<(Answers & { question_content: string })[]> {
  const rows = await q<AnswerRow & { question_content: string }>(
    `SELECT a.*, q.content as question_content 
     FROM answers a
     JOIN questions q ON a.question_id = q.question_id
     WHERE a.user_id = $3 
     ORDER BY a.created_at DESC 
     LIMIT $1 OFFSET $2`,
    [Math.min(Math.max(limit, 1), 100), Math.max(offset, 0), user_id],
  );
  return rows.map((r) => ({
    ...mapAnswer(r),
    question_content: r.question_content,
  }));
}

export async function listAnswersForQuestionDetailed(
  qid: QuestionID,
): Promise<any[]> {
  const rows = await q<any>(
    `SELECT a.*, u.user_name as author_name, u.institution as author_institution, u.profile_url as author_profile_url, u.credibility_score as author_credibility_score
     FROM answers a
     JOIN users u ON a.user_id = u.user_id
     WHERE a.question_id = $1 
     ORDER BY a.created_at ASC`,
    [qid],
  );
  return rows;
}
