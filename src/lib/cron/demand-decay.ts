import type { q as qFn } from "@/lib/db";

export type DecayResult = { updated: number };

export async function runDemandDecay(): Promise<DecayResult> {
  const q = require("@/lib/db").q as typeof qFn;

  // Decay demand_score by 5% every run
  const result = await q<{ updated: number }>(
    `
    WITH decayed AS (
      UPDATE questions 
      SET demand_score = demand_score * 0.95 
      WHERE demand_score > 0
      RETURNING 1
    )
    SELECT count(*) as updated FROM decayed;
    `
  );

  const updatedCount = Number(result[0]?.updated || 0);
  return { updated: updatedCount };
}
