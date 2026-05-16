import { withAuth, type AuthedRequest } from "@/lib/auth";
import { q } from "@/lib/db";
import { errorToResponse } from "@/lib/errors";
import type { ContentActivityKind } from "@/types/database";
import { NextResponse } from "next/server";

type ActivityRow = {
  kind: string;
  source_id: string;
  created_at: Date;
  actor_user_name: string;
  actor_profile_url: string | null;
  link_question_id: string | null;
  link_tutorial_id: string | null;
};

function hrefFromRow(row: ActivityRow): string | undefined {
  if (row.link_tutorial_id) return `/tutorials/${row.link_tutorial_id}`;
  if (row.link_question_id) return `/questions/${row.link_question_id}`;
  return undefined;
}

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
      SELECT x.kind, x.source_id, x.created_at, x.actor_user_name, x.actor_profile_url,
             x.link_question_id, x.link_tutorial_id
      FROM (
        SELECT 'comment'::text AS kind, c.comment_id::text AS source_id, c.created_at,
               u.user_name AS actor_user_name, u.profile_url AS actor_profile_url,
               q.question_id::text AS link_question_id, NULL::text AS link_tutorial_id
        FROM comments c
        INNER JOIN questions q ON q.question_id = c.question_id
        INNER JOIN users u ON u.user_id = c.user_id
        WHERE q.user_id = $1 AND c.user_id <> $1 AND c.created_at > $2::timestamptz

        UNION ALL
        SELECT 'comment', c.comment_id::text, c.created_at,
               u.user_name, u.profile_url,
               aq.question_id::text, NULL::text
        FROM comments c
        INNER JOIN answers a ON a.answer_id = c.answer_id
        INNER JOIN questions aq ON aq.question_id = a.question_id
        INNER JOIN users u ON u.user_id = c.user_id
        WHERE a.user_id = $1 AND c.user_id <> $1 AND c.created_at > $2::timestamptz

        UNION ALL
        SELECT 'comment', c.comment_id::text, c.created_at,
               u.user_name, u.profile_url,
               NULL::text, t.tutorial_id::text
        FROM comments c
        INNER JOIN tutorials t ON t.tutorial_id = c.tutorial_id
        INNER JOIN users u ON u.user_id = c.user_id
        WHERE t.user_id = $1 AND c.user_id <> $1 AND c.created_at > $2::timestamptz

        UNION ALL
        SELECT 'answer', a.answer_id::text, a.created_at,
               u.user_name, u.profile_url,
               q.question_id::text, NULL::text
        FROM answers a
        INNER JOIN questions q ON q.question_id = a.question_id
        INNER JOIN users u ON u.user_id = a.user_id
        WHERE q.user_id = $1 AND a.user_id <> $1 AND a.created_at > $2::timestamptz

        UNION ALL
        SELECT 'interaction', i.interaction_id::text, i.created_at,
               u.user_name, u.profile_url,
               q.question_id::text, NULL::text
        FROM interactions i
        INNER JOIN questions q ON q.question_id = i.question_id
        INNER JOIN users u ON u.user_id = i.user_id
        WHERE q.user_id = $1 AND i.user_id <> $1 AND i.created_at > $2::timestamptz

        UNION ALL
        SELECT 'interaction', i.interaction_id::text, i.created_at,
               u.user_name, u.profile_url,
               ans.question_id::text, NULL::text
        FROM interactions i
        INNER JOIN answers ans ON ans.answer_id = i.answer_id
        INNER JOIN users u ON u.user_id = i.user_id
        WHERE ans.user_id = $1 AND i.user_id <> $1 AND i.created_at > $2::timestamptz

        UNION ALL
        SELECT 'interaction', i.interaction_id::text, i.created_at,
               u.user_name, u.profile_url,
               COALESCE(cm.question_id::text, aq.question_id::text), cm.tutorial_id::text
        FROM interactions i
        INNER JOIN comments cm ON cm.comment_id = i.comment_id
        LEFT JOIN answers aq ON aq.answer_id = cm.answer_id
        INNER JOIN users u ON u.user_id = i.user_id
        WHERE cm.user_id = $1 AND i.user_id <> $1 AND i.created_at > $2::timestamptz

        UNION ALL
        SELECT 'interaction', i.interaction_id::text, i.created_at,
               u.user_name, u.profile_url,
               NULL::text, tt.tutorial_id::text
        FROM interactions i
        INNER JOIN tutorials tt ON tt.tutorial_id = i.tutorial_id
        INNER JOIN users u ON u.user_id = i.user_id
        WHERE tt.user_id = $1 AND i.user_id <> $1 AND i.created_at > $2::timestamptz
      ) x
      ORDER BY x.created_at ASC
      LIMIT 50
      `,
      [req.userId, since.toISOString()],
    );

    const events = rows.map((r) => {
      const href = hrefFromRow(r);
      const created_at =
        r.created_at instanceof Date
          ? r.created_at.toISOString()
          : String(r.created_at);
      return {
        id: `${r.kind}:${r.source_id}`,
        kind: r.kind as ContentActivityKind,
        created_at,
        actor_display_name: r.actor_user_name,
        actor_profile_url: r.actor_profile_url,
        href,
      };
    });

    return NextResponse.json({ events });
  } catch (error) {
    return errorToResponse(error);
  }
});
