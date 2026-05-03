import { one, q, qOn } from "@/lib/db";
import { asQuestionId, asUserId } from "@/lib/db-brands";
import { DatabaseError } from "@/lib/errors";
import type { QuestionID, Questions, UserID } from "@/types/database";
import type { PoolClient } from "pg";
import "server-only";

type QuestionRow = Omit<Questions, "question_id" | "user_id"> & {
  question_id: string;
  user_id: string;
};

function mapQuestion(r: QuestionRow): Questions {
  return {
    ...r,
    question_id: asQuestionId(r.question_id),
    user_id: asUserId(r.user_id),
  };
}

export async function getQuestionById(
  id: QuestionID,
): Promise<Questions | null> {
  const row = await one<QuestionRow>(
    "SELECT * FROM questions WHERE question_id = $1",
    [id],
  );
  return row ? mapQuestion(row) : null;
}

export async function listQuestions(
  limit: number,
  offset: number,
): Promise<Questions[]> {
  const rows = await q<QuestionRow>(
    "SELECT * FROM questions ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [Math.min(Math.max(limit, 1), 100), Math.max(offset, 0)],
  );
  return rows.map(mapQuestion);
}

export async function insertQuestion(
  user_id: UserID,
  content: string,
  category: string,
): Promise<Questions> {
  const row = await one<QuestionRow>(
    `INSERT INTO questions
       (question_id, user_id, content, category, demand_score, popped)
     VALUES (gen_random_uuid(), $1, $2, $3, 0, false)
     RETURNING *`,
    [user_id, content, category],
  );
  if (!row) throw new DatabaseError("insertQuestion: no row returned");
  return mapQuestion(row);
}

export async function getQuestionsByIds(
  ids: QuestionID[],
  client?: PoolClient,
): Promise<Pick<Questions, "question_id" | "user_id">[]> {
  if (ids.length === 0) return [];
  const sql =
    "SELECT question_id, user_id FROM questions WHERE question_id = ANY($1::uuid[])";
  const rows = client
    ? await qOn<{ question_id: string; user_id: string }>(client, sql, [ids])
    : await q<{ question_id: string; user_id: string }>(sql, [ids]);
  return rows.map((r) => ({
    question_id: asQuestionId(r.question_id),
    user_id: asUserId(r.user_id),
  }));
}

export async function markResolved(id: QuestionID): Promise<Questions | null> {
  const row = await one<QuestionRow>(
    "UPDATE questions SET resolved_at = now() WHERE question_id = $1 RETURNING *",
    [id],
  );
  return row ? mapQuestion(row) : null;
}
