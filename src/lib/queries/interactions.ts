import { one, q } from "@/lib/db";
import { rowToInteraction, type InteractionRow } from "@/lib/db-brands";
import { DatabaseError } from "@/lib/errors";
import type { Interaction, InteractionID, UserID } from "@/types/database";
import "server-only";

export async function getInteractionById(
  id: InteractionID,
): Promise<Interaction | null> {
  const row = await one<InteractionRow>(
    "SELECT * FROM interactions WHERE interaction_id = $1",
    [id],
  );
  return row ? rowToInteraction(row) : null;
}

export async function listInteractionsByUser(
  uid: UserID,
): Promise<Interaction[]> {
  const rows = await q<InteractionRow>(
    "SELECT * FROM interactions WHERE user_id = $1 ORDER BY created_at DESC",
    [uid],
  );
  return rows.map(rowToInteraction);
}

export async function insertInteraction(
  input: Omit<Interaction, "interaction_id" | "created_at">,
): Promise<Interaction> {
  const question_id = "question_id" in input ? input.question_id : null;
  const answer_id = "answer_id" in input ? input.answer_id : null;
  const comment_id = "comment_id" in input ? input.comment_id : null;
  const tutorial_id = "tutorial_id" in input ? input.tutorial_id : null;

  const row = await one<InteractionRow>(
    `INSERT INTO interactions
       (user_id, interaction_type, value, question_id, answer_id, comment_id, tutorial_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.user_id,
      input.interaction_type,
      input.value,
      question_id,
      answer_id,
      comment_id,
      tutorial_id,
    ],
  );
  if (!row) throw new DatabaseError("insertInteraction: no row returned");
  return rowToInteraction(row);
}
