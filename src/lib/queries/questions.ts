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
  user_id?: UserID,
): Promise<Questions[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safeOffset = Math.max(offset, 0);

  if (user_id) {
    const rows = await q<QuestionRow>(
      "SELECT * FROM questions WHERE user_id = $3 ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [safeLimit, safeOffset, user_id],
    );
    return rows.map(mapQuestion);
  }

  const rows = await q<QuestionRow>(
    "SELECT * FROM questions ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [safeLimit, safeOffset],
  );
  return rows.map(mapQuestion);
}

export async function insertQuestion(
  user_id: UserID,
  title: string,
  content: string,
  category: string,
): Promise<Questions> {
  const row = await one<QuestionRow>(
    `INSERT INTO questions
       (question_id, user_id, title, content, category, demand_score, popped)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, 0, false)
     RETURNING *`,
    [user_id, title, content, category],
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

export async function listQuestionsDetailed(
  limit: number,
  offset: number,
  category?: string,
  search?: string,
): Promise<any[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safeOffset = Math.max(offset, 0);

  let query = "SELECT * FROM question_details WHERE 1=1";
  const params: any[] = [];
  let paramIndex = 1;

  if (category && category !== "All") {
    query += ` AND category ILIKE $${paramIndex}`;
    params.push(`%${category}%`);
    paramIndex++;
  }

  if (search && search.trim()) {
    query += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(safeLimit, safeOffset);

  const rows = await q<any>(query, params);
  return rows.map((r) => ({
    ...r,
    user_name: r.user_name || r.author,
    profile_url: r.profile_url || r.profileURL,
  }));
}

export async function listQuestionsByUserDetailed(
  userId: UserID,
  limit: number,
  offset: number,
): Promise<any[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safeOffset = Math.max(offset, 0);

  const rows = await q<any>(
    "SELECT * FROM question_details WHERE user_id = $3 ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [safeLimit, safeOffset, userId],
  );
  return rows.map((r) => ({
    ...r,
    user_name: r.user_name || r.author,
    profile_url: r.profile_url || r.profileURL,
  }));
}

export async function getQuestionByIdDetailed(
  id: QuestionID,
): Promise<any | null> {
  const row = await one<any>(
    "SELECT * FROM question_details WHERE question_id = $1",
    [id],
  );
  if (!row) return null;
  return {
    ...row,
    user_name: row.user_name || row.author,
    profile_url: row.profile_url || row.profileURL,
  };
}

export async function deleteQuestion(id: QuestionID): Promise<void> {
  const { listMaterialsForQuestion } = await import("./question-materials");
  const { listAnswersForQuestionDetailed } = await import("./answers");
  const { listMaterialsForAnswer } = await import("./answer-materials");
  const { getStorage } = await import("@/lib/storage");

  try {
    const qMaterials = await listMaterialsForQuestion(id);
    const answers = await listAnswersForQuestionDetailed(id);
    const aMaterials = (
      await Promise.all(answers.map((a) => listMaterialsForAnswer(a.answer_id)))
    ).flat();

    const storage = getStorage();
    const allKeys = [...qMaterials, ...aMaterials].map((m) => m.storage_key);

    // Delete in background
    Promise.all(allKeys.map((key) => storage.delete(key).catch(() => {})));
  } catch (err) {
    console.error("[deleteQuestion] failed to cleanup media", err);
  }

  await q("DELETE FROM questions WHERE question_id = $1", [id]);
}
