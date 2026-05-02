import { q } from "@/lib/db";
import { asQuestionId, asTutorialId } from "@/lib/db-brands";
import type {
  QuestionID,
  QuestionsTutorials,
  TutorialID,
} from "@/types/database";
import "server-only";

type QTRow = { question_id: string; tutorial_id: string };

function mapQT(r: QTRow): QuestionsTutorials {
  return {
    question_id: asQuestionId(r.question_id),
    tutorial_id: asTutorialId(r.tutorial_id),
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

export async function tutorialsForQuestion(
  qid: QuestionID,
): Promise<QuestionsTutorials[]> {
  const rows = await q<QTRow>(
    "SELECT * FROM questions_tutorials WHERE question_id = $1",
    [qid],
  );
  return rows.map(mapQT);
}

export async function questionsForTutorial(
  tid: TutorialID,
): Promise<QuestionsTutorials[]> {
  const rows = await q<QTRow>(
    "SELECT * FROM questions_tutorials WHERE tutorial_id = $1",
    [tid],
  );
  return rows.map(mapQT);
}
