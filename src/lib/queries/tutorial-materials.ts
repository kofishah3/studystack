import { one, q } from "@/lib/db";
import { asTutorialId, asTutorialMaterialId } from "@/lib/db-brands";
import { DatabaseError } from "@/lib/errors";
import type {
  TutorialID,
  TutorialMaterial,
  TutorialMaterialID,
} from "@/types/database";
import "server-only";

type TutorialMaterialRow = Omit<
  TutorialMaterial,
  "material_id" | "tutorial_id" | "size_bytes"
> & {
  material_id: string;
  tutorial_id: string;
  size_bytes: string | number;
};

function mapMaterial(r: TutorialMaterialRow): TutorialMaterial {
  return {
    ...r,
    material_id: asTutorialMaterialId(r.material_id),
    tutorial_id: asTutorialId(r.tutorial_id),
    size_bytes:
      typeof r.size_bytes === "string"
        ? Number(r.size_bytes)
        : r.size_bytes,
  };
}

export async function insertTutorialMaterial(input: {
  tutorial_id: TutorialID;
  file_name: string;
  storage_key: string;
  mime_type: string;
  size_bytes: number;
}): Promise<TutorialMaterial> {
  const row = await one<TutorialMaterialRow>(
    `INSERT INTO tutorial_materials
       (material_id, tutorial_id, file_name, storage_key, mime_type, size_bytes)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
     RETURNING *`,
    [
      input.tutorial_id,
      input.file_name,
      input.storage_key,
      input.mime_type,
      input.size_bytes,
    ],
  );
  if (!row) throw new DatabaseError("insertTutorialMaterial: no row returned");
  return mapMaterial(row);
}

export async function listMaterialsForTutorial(
  tid: TutorialID,
): Promise<TutorialMaterial[]> {
  const rows = await q<TutorialMaterialRow>(
    `SELECT * FROM tutorial_materials
     WHERE tutorial_id = $1
     ORDER BY uploaded_at DESC`,
    [tid],
  );
  return rows.map(mapMaterial);
}

export async function getMaterialById(
  id: TutorialMaterialID,
): Promise<TutorialMaterial | null> {
  const row = await one<TutorialMaterialRow>(
    "SELECT * FROM tutorial_materials WHERE material_id = $1",
    [id],
  );
  return row ? mapMaterial(row) : null;
}

export async function deleteMaterial(
  id: TutorialMaterialID,
): Promise<TutorialMaterial | null> {
  const row = await one<TutorialMaterialRow>(
    "DELETE FROM tutorial_materials WHERE material_id = $1 RETURNING *",
    [id],
  );
  return row ? mapMaterial(row) : null;
}
