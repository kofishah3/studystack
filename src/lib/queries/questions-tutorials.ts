import 'server-only';
import { q } from '@/lib/db';
import type { QuestionsTutorials, QuestionID, TutorialID } from '@/types/database';

type QTRow = { question_id: string; tutorial_id: string };

function mapQT(r: QTRow): QuestionsTutorials {
  return {
    question_id: r.question_id as QuestionID,
    tutorial_id: r.tutorial_id as TutorialID,
  };
}

export async function linkQuestionTutorial(
  qid: QuestionID,
  tid: TutorialID,
): Promise<QuestionsTutorials[]> {
  const rows = await q<QTRow>(
    `INSERT INTO questions_tutorials (question_id, tutorial_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
    [qid, tid],
  );
  return rows.map(mapQT);
}

export async function unlinkQuestionTutorial(
  qid: QuestionID,
  tid: TutorialID,
): Promise<QuestionsTutorials[]> {
  const rows = await q<QTRow>(
    `DELETE FROM questions_tutorials
     WHERE question_id = $1 AND tutorial_id = $2 RETURNING *`,
    [qid, tid],
  );
  return rows.map(mapQT);
}

export async function tutorialsForQuestion(qid: QuestionID): Promise<QuestionsTutorials[]> {
  const rows = await q<QTRow>(
    'SELECT * FROM questions_tutorials WHERE question_id = $1',
    [qid],
  );
  return rows.map(mapQT);
}
