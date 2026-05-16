import { withAuth, type AuthedRequest } from "@/lib/auth";
import { q } from "@/lib/db";
import { errorToResponse } from "@/lib/errors";
import type { ContentActivityKind } from "@/types/database";
import { NextResponse } from "next/server";

type ActivityRow = {
  kind: string;
  source_id: string;
  created_at: Date;
};

/** Recent activity on this user's content (for clients without Socket.IO, e.g. Vercel). */
export const GET = withAuth(async (req: AuthedRequest, _ctx: unknown) => {
  try {
    const sinceParam = req.nextUrl.searchParams.get("since");
    const since = sinceParam ? new Date(sinceParam) : new Date();
    if (sinceParam && Number.isNaN(since.getTime())) {
      return NextResponse.json({ error: "Invalid since" }, { status: 400 });
    }

    const rows = await q<ActivityRow>(
      `
      SELECT x.kind, x.source_id, x.created_at FROM (
        SELECT 'comment'::text AS kind, c.comment_id::text AS source_id, c.created_at
        FROM comments c
        INNER JOIN questions q ON q.question_id = c.question_id
        WHERE q.user_id = $1 AND c.user_id <> $1 AND c.created_at > $2::timestamptz
        UNION ALL
        SELECT 'comment', c.comment_id::text, c.created_at
        FROM comments c
        INNER JOIN answers a ON a.answer_id = c.answer_id
        WHERE a.user_id = $1 AND c.user_id <> $1 AND c.created_at > $2::timestamptz
        UNION ALL
        SELECT 'comment', c.comment_id::text, c.created_at
        FROM comments c
        INNER JOIN tutorials t ON t.tutorial_id = c.tutorial_id
        WHERE t.user_id = $1 AND c.user_id <> $1 AND c.created_at > $2::timestamptz
        UNION ALL
        SELECT 'answer', a.answer_id::text, a.created_at
        FROM answers a
        INNER JOIN questions q ON q.question_id = a.question_id
        WHERE q.user_id = $1 AND a.user_id <> $1 AND a.created_at > $2::timestamptz
        UNION ALL
        SELECT 'interaction', i.interaction_id::text, i.created_at
        FROM interactions i
        INNER JOIN questions q ON q.question_id = i.question_id
        WHERE q.user_id = $1 AND i.user_id <> $1 AND i.created_at > $2::timestamptz
        UNION ALL
        SELECT 'interaction', i.interaction_id::text, i.created_at
        FROM interactions i
        INNER JOIN answers a ON a.answer_id = i.answer_id
        WHERE a.user_id = $1 AND i.user_id <> $1 AND i.created_at > $2::timestamptz
        UNION ALL
        SELECT 'interaction', i.interaction_id::text, i.created_at
        FROM interactions i
        INNER JOIN comments cm ON cm.comment_id = i.comment_id
        WHERE cm.user_id = $1 AND i.user_id <> $1 AND i.created_at > $2::timestamptz
        UNION ALL
        SELECT 'interaction', i.interaction_id::text, i.created_at
        FROM interactions i
        INNER JOIN tutorials t ON t.tutorial_id = i.tutorial_id
        WHERE t.user_id = $1 AND i.user_id <> $1 AND i.created_at > $2::timestamptz
      ) x
      ORDER BY x.created_at ASC
      LIMIT 50
      `,
      [req.userId, since.toISOString()],
    );

    const events = rows.map((r) => ({
      id: `${r.kind}:${r.source_id}`,
      kind: r.kind as ContentActivityKind,
      created_at:
        r.created_at instanceof Date
          ? r.created_at.toISOString()
          : String(r.created_at),
    }));

    return NextResponse.json({ events });
  } catch (error) {
    return errorToResponse(error);
  }
});
