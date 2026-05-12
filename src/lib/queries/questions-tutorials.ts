import { q, qOn } from "@/lib/db";
import { asQuestionId, asTutorialId } from "@/lib/db-brands";
import type {
  QuestionID,
  QuestionsTutorials,
  TutorialID,
} from "@/types/database";
import type { PoolClient } from "pg";
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
  client?: PoolClient,
): Promise<{ link: QuestionsTutorials; created: boolean }> {
  const insertSql = `INSERT INTO questions_tutorials (question_id, tutorial_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`;
  const inserted = client
    ? await qOn<QTRow>(client, insertSql, [qid, tid])
    : await q<QTRow>(insertSql, [qid, tid]);
  if (inserted.length > 0) {
    return { link: mapQT(inserted[0]), created: true };
  }
  return {
    link: mapQT({ question_id: qid, tutorial_id: tid }),
    created: false,
  };
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
export async function listQuestionsForTutorialDetailed(
  tid: TutorialID,
): Promise<{ question_id: QuestionID; title: string }[]> {
  const rows = await q<{ question_id: string; title: string }>(
    `SELECT q.question_id, q.title 
     FROM questions_tutorials qt
     JOIN questions q ON q.question_id = qt.question_id
     WHERE qt.tutorial_id = $1`,
    [tid],
  );
  return rows.map((r) => ({
    question_id: asQuestionId(r.question_id),
    title: r.title,
  }));
}
