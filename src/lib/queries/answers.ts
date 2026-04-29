import 'server-only';
import { q, one } from '@/lib/db';
import { asAnswerId } from '@/lib/db-brands';
import type { Answers, AnswerID, QuestionID, UserID } from '@/types/database';

type AnswerRow = Omit<Answers, 'answer_id' | 'user_id' | 'question_id'> & {
  answer_id: number;
  user_id: string;
  question_id: string;
};

function mapAnswer(r: AnswerRow): Answers {
  return {
    ...r,
    answer_id: asAnswerId(r.answer_id),
    user_id: r.user_id as UserID,
    question_id: r.question_id as QuestionID,
  };
}

export async function getAnswerById(id: AnswerID): Promise<Answers | null> {
  const row = await one<AnswerRow>(
    'SELECT * FROM answers WHERE answer_id = $1',
    [id],
  );
  return row ? mapAnswer(row) : null;
}

export async function listAnswersForQuestion(qid: QuestionID): Promise<Answers[]> {
  const rows = await q<AnswerRow>(
    'SELECT * FROM answers WHERE question_id = $1 ORDER BY created_at ASC',
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
  if (!row) throw new Error('insertAnswer: no row returned');
  return mapAnswer(row);
}

export async function acceptAnswer(id: AnswerID): Promise<Answers | null> {
  const row = await one<AnswerRow>(
    'UPDATE answers SET is_accepted = true WHERE answer_id = $1 RETURNING *',
    [id],
  );
  return row ? mapAnswer(row) : null;
}
