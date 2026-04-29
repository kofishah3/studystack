import 'server-only';
import { q, one } from '@/lib/db';
import { asCommentId } from '@/lib/db-brands';
import type { Comments, CommentID, UserID, QuestionID, AnswerID, TutorialID } from '@/types/database';

type CommentRow = Omit<Comments, 'comment_id' | 'user_id' | 'parent_comment_id' | 'question_id' | 'answer_id' | 'tutorial_id'> & {
  comment_id: number;
  user_id: string;
  parent_comment_id: number | null;
  question_id: string;
  answer_id: number | null;
  tutorial_id: string | null;
};

function mapComment(r: CommentRow): Comments {
  return {
    ...r,
    comment_id: asCommentId(r.comment_id),
    user_id: r.user_id as UserID,
    parent_comment_id: r.parent_comment_id !== null ? asCommentId(r.parent_comment_id) : null,
    question_id: r.question_id as QuestionID,
    answer_id: r.answer_id !== null ? (r.answer_id as unknown as AnswerID) : null,
    tutorial_id: r.tutorial_id !== null ? (r.tutorial_id as unknown as TutorialID) : null,
  };
}

export async function getCommentById(id: CommentID): Promise<Comments | null> {
  const row = await one<CommentRow>(
    'SELECT * FROM comments WHERE comment_id = $1',
    [id],
  );
  return row ? mapComment(row) : null;
}

export async function listCommentsForQuestion(qid: QuestionID): Promise<Comments[]> {
  const rows = await q<CommentRow>(
    'SELECT * FROM comments WHERE question_id = $1 ORDER BY created_at ASC',
    [qid],
  );
  return rows.map(mapComment);
}

export async function listCommentsForAnswer(aid: AnswerID): Promise<Comments[]> {
  const rows = await q<CommentRow>(
    'SELECT * FROM comments WHERE answer_id = $1 ORDER BY created_at ASC',
    [aid],
  );
  return rows.map(mapComment);
}

export async function listCommentsForTutorial(tid: TutorialID): Promise<Comments[]> {
  const rows = await q<CommentRow>(
    'SELECT * FROM comments WHERE tutorial_id = $1 ORDER BY created_at ASC',
    [tid],
  );
  return rows.map(mapComment);
}

export async function insertComment(
  input: Omit<Comments, 'comment_id' | 'created_at'>,
): Promise<Comments> {
  const row = await one<CommentRow>(
    `INSERT INTO comments
       (user_id, content, parent_comment_id, question_id, answer_id, tutorial_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [input.user_id, input.content, input.parent_comment_id,
     input.question_id, input.answer_id, input.tutorial_id],
  );
  if (!row) throw new Error('insertComment: no row returned');
  return mapComment(row);
}
