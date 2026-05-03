import { DatabaseError } from "@/lib/errors";
import type {
  AnswerID,
  CommentID,
  Interaction,
  InteractionID,
  QuestionID,
  TutorialID,
  TutorialMaterialID,
  UserID,
} from "@/types/database";
import "server-only";

export const asUserId = (s: string) => s as UserID;
export const asQuestionId = (s: string) => s as QuestionID;
export const asTutorialId = (s: string) => s as TutorialID;
export const asAnswerId = (n: number) => n as AnswerID;
export const asCommentId = (n: number) => n as CommentID;
export const asInteractionId = (n: number) => n as InteractionID;
export const asTutorialMaterialId = (s: string) => s as TutorialMaterialID;

export type InteractionRow = {
  interaction_id: number;
  user_id: string;
  interaction_type: "react" | "rating";
  value: number | null;
  created_at: Date;
  question_id: string | null;
  answer_id: number | null;
  comment_id: number | null;
  tutorial_id: string | null;
};

export function rowToInteraction(r: InteractionRow): Interaction {
  const setCount = [
    r.question_id,
    r.answer_id,
    r.comment_id,
    r.tutorial_id,
  ].filter((v) => v !== null).length;

  if (setCount !== 1) {
    throw new DatabaseError(
      `Interaction ${r.interaction_id} violates exactly-one-FK CHECK constraint: ${setCount} FK(s) set, expected 1`,
    );
  }

  const base = {
    interaction_id: asInteractionId(r.interaction_id),
    user_id: asUserId(r.user_id),
    interaction_type: r.interaction_type,
    value: r.value,
    created_at: r.created_at,
  };

  if (r.question_id !== null)
    return { ...base, question_id: asQuestionId(r.question_id) };
  if (r.answer_id !== null)
    return { ...base, answer_id: asAnswerId(r.answer_id) };
  if (r.comment_id !== null)
    return { ...base, comment_id: asCommentId(r.comment_id) };
  return { ...base, tutorial_id: asTutorialId(r.tutorial_id!) };
}
