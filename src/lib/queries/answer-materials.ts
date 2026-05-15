import { q, one } from "@/lib/db";
import type { AnswerID } from "@/types/database";
import "server-only";

export interface AnswerMaterial {
  material_id: string;
  answer_id: number;
  file_name: string;
  storage_key: string;
  mime_type: string;
  size_bytes: string;
  uploaded_at: string;
}

export async function insertAnswerMaterial(
  m: Omit<AnswerMaterial, "material_id" | "uploaded_at">,
): Promise<AnswerMaterial> {
  const row = await one<AnswerMaterial>(
    `INSERT INTO answer_materials (answer_id, file_name, storage_key, mime_type, size_bytes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [m.answer_id, m.file_name, m.storage_key, m.mime_type, m.size_bytes],
  );
  if (!row) throw new Error("Failed to insert answer material");
  return row;
}

export async function listMaterialsForAnswer(
  answer_id: AnswerID,
): Promise<AnswerMaterial[]> {
  return q<AnswerMaterial>(
    "SELECT * FROM answer_materials WHERE answer_id = $1 ORDER BY uploaded_at ASC",
    [answer_id],
  );
}

export async function deleteAnswerMaterial(material_id: string): Promise<void> {
  await q("DELETE FROM answer_materials WHERE material_id = $1", [material_id]);
}
