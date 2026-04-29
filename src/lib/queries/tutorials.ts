import 'server-only';
import { q, one } from '@/lib/db';
import { asTutorialId } from '@/lib/db-brands';
import type { Tutorials, TutorialID, UserID, QuestionID } from '@/types/database';

type TutorialRow = Omit<Tutorials, 'tutorial_id' | 'user_id' | 'question_id'> & {
  tutorial_id: string;
  user_id: string;
  question_id: string | null;
};

function mapTutorial(r: TutorialRow): Tutorials {
  return {
    ...r,
    tutorial_id: asTutorialId(r.tutorial_id),
    user_id: r.user_id as UserID,
    question_id: r.question_id !== null ? (r.question_id as unknown as QuestionID) : null,
  };
}

export async function getTutorialById(id: TutorialID): Promise<Tutorials | null> {
  const row = await one<TutorialRow>(
    'SELECT * FROM tutorials WHERE tutorial_id = $1',
    [id],
  );
  return row ? mapTutorial(row) : null;
}

export async function listTutorials(limit: number, offset: number): Promise<Tutorials[]> {
  const rows = await q<TutorialRow>(
    'SELECT * FROM tutorials ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [Math.min(Math.max(limit, 1), 100), Math.max(offset, 0)],
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
     VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)
     RETURNING *`,
    [input.user_id, input.question_id, input.title, input.content, input.embedded_video_url],
  );
  if (!row) throw new Error('insertTutorial: no row returned');
  return mapTutorial(row);
}
