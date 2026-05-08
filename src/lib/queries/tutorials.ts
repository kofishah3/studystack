import { one, oneOn, q } from "@/lib/db";
import { asTutorialId, asUserId } from "@/lib/db-brands";
import { DatabaseError } from "@/lib/errors";
import type { TutorialID, Tutorials, UserID } from "@/types/database";
import type { PoolClient } from "pg";
import "server-only";

type TutorialRow = Omit<Tutorials, "tutorial_id" | "user_id"> & {
  tutorial_id: string;
  user_id: string;
};

function mapTutorial(r: TutorialRow): Tutorials {
  return {
    ...r,
    tutorial_id: asTutorialId(r.tutorial_id),
    user_id: asUserId(r.user_id),
  };
}

export async function getTutorialById(
  id: TutorialID,
): Promise<Tutorials | null> {
  const row = await one<TutorialRow>(
    "SELECT * FROM tutorials WHERE tutorial_id = $1 AND deleted_at IS NULL",
    [id],
  );
  return row ? mapTutorial(row) : null;
}

export async function listTutorials(
  limit: number,
  offset: number,
  category?: string,
  user_id?: UserID,
): Promise<Tutorials[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safeOffset = Math.max(offset, 0);

  const conditions: string[] = ["t.deleted_at IS NULL"];
  const params: any[] = [safeLimit, safeOffset];

  if (category) {
    params.push(category);
    conditions.push(`q.category = $${params.length}`);
  }

  if (user_id) {
    params.push(user_id);
    conditions.push(`t.user_id = $${params.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = await q<TutorialRow>(
    `SELECT DISTINCT t.* FROM tutorials t
     LEFT JOIN questions_tutorials qt ON qt.tutorial_id = t.tutorial_id
     LEFT JOIN questions q ON q.question_id = qt.question_id
     ${whereClause}
     ORDER BY t.created_at DESC
     LIMIT $1 OFFSET $2`,
    params,
  );
  return rows.map(mapTutorial);
}

export async function insertTutorial(
  input: {
    user_id: UserID;
    title: string;
    content: string;
    embedded_video_url: string | null;
  },
  client?: PoolClient,
): Promise<Tutorials> {
  const sql = `INSERT INTO tutorials
       (tutorial_id, user_id, title, content, embedded_video_url)
     VALUES (gen_random_uuid(), $1, $2, $3, $4)
     RETURNING *`;
  const params = [
    input.user_id,
    input.title,
    input.content,
    input.embedded_video_url,
  ];
  const row = client
    ? await oneOn<TutorialRow>(client, sql, params)
    : await one<TutorialRow>(sql, params);
  if (!row) throw new DatabaseError("insertTutorial: no row returned");
  return mapTutorial(row);
}

export async function updateTutorial(
  id: TutorialID,
  input: {
    title?: string;
    content?: string;
    embedded_video_url?: string | null;
  },
): Promise<Tutorials | null> {
  const sets: string[] = [];
  const params: unknown[] = [];

  if (input.title !== undefined) {
    params.push(input.title);
    sets.push(`title = $${params.length}`);
  }
  if (input.content !== undefined) {
    params.push(input.content);
    sets.push(`content = $${params.length}`);
  }
  if (input.embedded_video_url !== undefined) {
    params.push(input.embedded_video_url);
    sets.push(`embedded_video_url = $${params.length}`);
  }

  if (sets.length === 0) {
    return getTutorialById(id);
  }

  params.push(id);
  const row = await one<TutorialRow>(
    `UPDATE tutorials SET ${sets.join(", ")}
     WHERE tutorial_id = $${params.length} AND deleted_at IS NULL
     RETURNING *`,
    params,
  );
  return row ? mapTutorial(row) : null;
}

export async function softDeleteTutorial(
  id: TutorialID,
): Promise<Tutorials | null> {
  const row = await one<TutorialRow>(
    `UPDATE tutorials SET deleted_at = now()
     WHERE tutorial_id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id],
  );
  return row ? mapTutorial(row) : null;
}

export async function hardDeleteExpiredTutorials(
  olderThanDays: number,
): Promise<number> {
  const rows = await q<{ tutorial_id: string }>(
    `DELETE FROM tutorials
     WHERE deleted_at IS NOT NULL
       AND deleted_at < now() - ($1 || ' days')::interval
     RETURNING tutorial_id`,
    [olderThanDays],
  );
  return rows.length;
}
export async function listTutorialsDetailed(
  limit: number,
  offset: number,
): Promise<any[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safeOffset = Math.max(offset, 0);

  const rows = await q<any>(
    "SELECT * FROM tutorial_stats ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [safeLimit, safeOffset],
  );
  return rows;
}
