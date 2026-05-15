// PATH: src/lib/queries/comments.ts  (replace existing file)

import { one, q } from "@/lib/db";
import {
  asAnswerId,
  asCommentId,
  asQuestionId,
  asTutorialId,
  asUserId,
} from "@/lib/db-brands";
import { DatabaseError } from "@/lib/errors";
import type {
  AnswerID,
  CommentID,
  Comments,
  QuestionID,
  TutorialID,
} from "@/types/database";
import "server-only";

type CommentRow = Omit<
  Comments,
  | "comment_id"
  | "user_id"
  | "parent_comment_id"
  | "question_id"
  | "answer_id"
  | "tutorial_id"
> & {
  comment_id: number;
  user_id: string;
  parent_comment_id: number | null;
  question_id: string | null; // FIX: was `string`, must be nullable
  answer_id: number | null;
  tutorial_id: string | null;
};

// FIX: question_id was always cast via asQuestionId even when null → runtime crash
// on answer-level or tutorial-level comments.
function mapComment(r: CommentRow): Comments {
  return {
    ...r,
    comment_id: asCommentId(r.comment_id),
    user_id: asUserId(r.user_id),
    parent_comment_id:
      r.parent_comment_id !== null ? asCommentId(r.parent_comment_id) : null,
    question_id: r.question_id !== null ? asQuestionId(r.question_id) : null,
    answer_id: r.answer_id !== null ? asAnswerId(r.answer_id) : null,
    tutorial_id: r.tutorial_id !== null ? asTutorialId(r.tutorial_id) : null,
  };
}

export async function getCommentById(id: CommentID): Promise<Comments | null> {
  const row = await one<CommentRow>(
    "SELECT * FROM comments WHERE comment_id = $1",
    [id],
  );
  return row ? mapComment(row) : null;
}

export async function listCommentsForQuestion(
  qid: QuestionID,
): Promise<Comments[]> {
  const rows = await q<CommentRow>(
    "SELECT * FROM comments WHERE question_id = $1 ORDER BY created_at ASC",
    [qid],
  );
  return rows.map(mapComment);
}

export async function listCommentsForAnswer(
  aid: AnswerID,
): Promise<Comments[]> {
  const rows = await q<CommentRow>(
    "SELECT * FROM comments WHERE answer_id = $1 ORDER BY created_at ASC",
    [aid],
  );
  return rows.map(mapComment);
}

export async function listCommentsForTutorial(
  tid: TutorialID,
): Promise<Comments[]> {
  const rows = await q<CommentRow>(
    "SELECT * FROM comments WHERE tutorial_id = $1 ORDER BY created_at ASC",
    [tid],
  );
  return rows.map(mapComment);
}

export async function insertComment(
  input: Omit<Comments, "comment_id" | "created_at">,
): Promise<Comments> {
  const row = await one<CommentRow>(
    `INSERT INTO comments
       (user_id, content, parent_comment_id, question_id, answer_id, tutorial_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      input.user_id,
      input.content,
      input.parent_comment_id ?? null,
      input.question_id ?? null,
      input.answer_id ?? null,
      input.tutorial_id ?? null,
    ],
  );
  if (!row) throw new DatabaseError("insertComment: no row returned");
  return mapComment(row);
}

export async function listCommentsForQuestionDetailed(
  qid: QuestionID,
): Promise<any[]> {
  const rows = await q<any>(
    `SELECT c.*, u.user_name as author_name, u.profile_url as author_profile_url
     FROM comments c
     JOIN users u ON c.user_id = u.user_id
     WHERE c.question_id = $1
     ORDER BY c.created_at ASC`,
    [qid],
  );
  return rows;
}

export async function listCommentsForAnswerDetailed(
  aid: AnswerID,
): Promise<any[]> {
  const rows = await q<any>(
    `SELECT c.*, u.user_name as author_name, u.profile_url as author_profile_url
     FROM comments c
     JOIN users u ON c.user_id = u.user_id
     WHERE c.answer_id = $1
     ORDER BY c.created_at ASC`,
    [aid],
  );
  return rows;
}

export async function listCommentsForTutorialDetailed(
  tid: TutorialID,
): Promise<any[]> {
  const rows = await q<any>(
    `SELECT c.*, u.user_name as author_name, u.profile_url as author_profile_url
     FROM comments c
     JOIN users u ON c.user_id = u.user_id
     WHERE c.tutorial_id = $1
     ORDER BY c.created_at ASC`,
    [tid],
  );
  return rows;
}

export async function deleteComment(
  id: CommentID,
  userId: string,
): Promise<boolean> {
  const row = await one<{ comment_id: number }>(
    "DELETE FROM comments WHERE comment_id = $1 AND user_id = $2 RETURNING comment_id",
    [id, userId],
  );
  return !!row;
}