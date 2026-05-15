import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export async function GET() {
  try {
    const result = await q(`
      SELECT tag, COUNT(*) as count
      FROM (
        SELECT regexp_split_to_table(category, ',\\s*') as tag
        FROM questions
        WHERE category IS NOT NULL AND category != ''
      ) t
      WHERE tag != ''
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 12
    `);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
