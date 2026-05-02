import { one, q } from "@/lib/db";
import { asQuestionId, asTutorialId, asUserId } from "@/lib/db-brands";
import { DatabaseError } from "@/lib/errors";
import type {
  QuestionID,
  TutorialID,
  Tutorials,
  UserID,
} from "@/types/database";
import "server-only";

type TutorialRow = Omit<
  Tutorials,
  "tutorial_id" | "user_id" | "question_id"
> & {
  tutorial_id: string;
  user_id: string;
  question_id: string | null;
};

function mapTutorial(r: TutorialRow): Tutorials {
  return {
    ...r,
    tutorial_id: asTutorialId(r.tutorial_id),
    user_id: asUserId(r.user_id),
    question_id: r.question_id !== null ? asQuestionId(r.question_id) : null,
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
): Promise<Tutorials[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safeOffset = Math.max(offset, 0);

  if (category) {
    const rows = await q<TutorialRow>(
      `SELECT DISTINCT t.* FROM tutorials t
       LEFT JOIN questions_tutorials qt ON qt.tutorial_id = t.tutorial_id
       LEFT JOIN questions q ON q.question_id = qt.question_id
       WHERE t.deleted_at IS NULL AND q.category = $3
       ORDER BY t.created_at DESC
       LIMIT $1 OFFSET $2`,
      [safeLimit, safeOffset, category],
    );
    return rows.map(mapTutorial);
  }

  const rows = await q<TutorialRow>(
    `SELECT * FROM tutorials
     WHERE deleted_at IS NULL
     ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [safeLimit, safeOffset],
  );
  return rows.map(mapTutorial);
}

export async function insertTutorial(input: {
  user_id: UserID;
  question_id: QuestionID | null;
  title: string;
  content: string;
  embedded_video_url: string | null;
}): Promise<Tutorials> {
  const row = await one<TutorialRow>(
    `INSERT INTO tutorials
       (tutorial_id, user_id, question_id, title, content, embedded_video_url)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
     RETURNING *`,
    [
      input.user_id,
      input.question_id,
      input.title,
      input.content,
      input.embedded_video_url,
    ],
  );
  if (!row) throw new DatabaseError("insertTutorial: no row returned");
  return mapTutorial(row);
}
