import 'server-only';
import type {
  UserID, QuestionID, TutorialID,
  AnswerID, CommentID, InteractionID,
  Interaction,
} from '@/types/database';

// Brand constructors — identity functions at runtime, branded at compile time.
// All raw pg row values enter the type system through one of these.
export const asUserId        = (s: string) => s as UserID;
export const asQuestionId    = (s: string) => s as QuestionID;
export const asTutorialId    = (s: string) => s as TutorialID;
export const asAnswerId      = (n: number) => n as AnswerID;
export const asCommentId     = (n: number) => n as CommentID;
export const asInteractionId = (n: number) => n as InteractionID;

// The raw shape of an interactions row from pg — all four FK columns present
// but nullable, exactly one non-null per the DB CHECK constraint.
export type InteractionRow = {
  interaction_id: number;
  user_id: string;
  interaction_type: 'react' | 'rating';
  value: number | null;
  created_at: Date;
  question_id: string | null;
  answer_id: number | null;
  comment_id: number | null;
  tutorial_id: string | null;
};

// Collapses the four-nullable-FK row into the correct Interaction union variant.
// Throws if the DB CHECK constraint is somehow violated (more than one FK set).
export function rowToInteraction(r: InteractionRow): Interaction {
  const setCount = [r.question_id, r.answer_id, r.comment_id, r.tutorial_id]
    .filter(v => v !== null).length;

  if (setCount !== 1) {
    throw new Error(
      `Interaction ${r.interaction_id} has ${setCount} FK(s) set; expected exactly 1`,
    );
  }

  const base = {
    interaction_id: asInteractionId(r.interaction_id),
    user_id: asUserId(r.user_id),
    interaction_type: r.interaction_type,
    value: r.value,
    created_at: r.created_at,
  };

  if (r.question_id !== null) return { ...base, question_id: asQuestionId(r.question_id) };
  if (r.answer_id   !== null) return { ...base, answer_id:   asAnswerId(r.answer_id) };
  if (r.comment_id  !== null) return { ...base, comment_id:  asCommentId(r.comment_id) };
  return { ...base, tutorial_id: asTutorialId(r.tutorial_id!) };
}
