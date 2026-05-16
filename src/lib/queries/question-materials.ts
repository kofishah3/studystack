import { one, q } from "@/lib/db";
import { asQuestionId, asQuestionMaterialId } from "@/lib/db-brands";
import { DatabaseError } from "@/lib/errors";
import type {
  QuestionID,
  QuestionMaterial,
  QuestionMaterialID,
} from "@/types/database";
import "server-only";

type QuestionMaterialRow = Omit<
  QuestionMaterial,
  "material_id" | "question_id" | "size_bytes"
> & {
  material_id: string;
  question_id: string;
  size_bytes: string | number;
};

function mapMaterial(r: QuestionMaterialRow): QuestionMaterial {
  return {
    ...r,
    material_id: asQuestionMaterialId(r.material_id),
    question_id: asQuestionId(r.question_id),
    size_bytes:
      typeof r.size_bytes === "string"
        ? Number(r.size_bytes)
        : r.size_bytes,
  };
}

export async function insertQuestionMaterial(input: {
  question_id: QuestionID;
  file_name: string;
  storage_key: string;
  mime_type: string;
  size_bytes: number;
}): Promise<QuestionMaterial> {
  const row = await one<QuestionMaterialRow>(
    `INSERT INTO question_materials
       (material_id, question_id, file_name, storage_key, mime_type, size_bytes)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
     RETURNING *`,
    [
      input.question_id,
      input.file_name,
      input.storage_key,
      input.mime_type,
      input.size_bytes,
    ],
  );
  if (!row) throw new DatabaseError("insertQuestionMaterial: no row returned");
  return mapMaterial(row);
}

export async function listMaterialsForQuestion(
  qid: QuestionID,
): Promise<QuestionMaterial[]> {
  const rows = await q<QuestionMaterialRow>(
    `SELECT * FROM question_materials
     WHERE question_id = $1
     ORDER BY uploaded_at DESC`,
    [qid],
  );
  return rows.map(mapMaterial);
}

export async function getMaterialById(
  id: QuestionMaterialID,
): Promise<QuestionMaterial | null> {
  const row = await one<QuestionMaterialRow>(
    "SELECT * FROM question_materials WHERE material_id = $1",
    [id],
  );
  return row ? mapMaterial(row) : null;
}

export async function deleteMaterial(
  id: QuestionMaterialID,
): Promise<QuestionMaterial | null> {
  const row = await one<QuestionMaterialRow>(
    "DELETE FROM question_materials WHERE material_id = $1 RETURNING *",
    [id],
  );
  return row ? mapMaterial(row) : null;
}
