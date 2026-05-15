import { one, q } from "@/lib/db";
import { asUserId } from "@/lib/db-brands";
import { DatabaseError } from "@/lib/errors";
import type { User, UserID } from "@/types/database";

type UserRow = Omit<User, "user_id"> & { user_id: string };

function mapUser(r: UserRow): User {
  return { ...r, user_id: asUserId(r.user_id) };
}

export async function getUserById(id: UserID): Promise<User | null> {
  const row = await one<UserRow>("SELECT * FROM users WHERE user_id = $1", [
    id,
  ]);
  return row ? mapUser(row) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const row = await one<UserRow>("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return row ? mapUser(row) : null;
}

export async function getUserByUsername(
  user_name: string,
): Promise<User | null> {
  const row = await one<UserRow>(
    "SELECT * FROM users WHERE LOWER(user_name) = LOWER($1)",
    [user_name],
  );
  return row ? mapUser(row) : null;
}

export async function insertUser(
  input: Omit<User, "user_id" | "created_at">,
): Promise<User> {
  const row = await one<UserRow>(
    `INSERT INTO users
       (user_id, user_name, email, password_hash, age, gender, institution, education_level, degree_program)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      input.user_name,
      input.email,
      input.password_hash,
      input.age,
      input.gender,
      input.institution,
      input.education_level,
      input.degree_program || null,
    ],
  );
  if (!row) throw new DatabaseError("insertUser: no row returned");
  return mapUser(row);
}

export async function updateUser(
  id: UserID,
  input: Partial<
    Omit<User, "user_id" | "created_at" | "password_hash" | "email">
  >,
): Promise<User | null> {
  const fields = Object.keys(input);
  if (fields.length === 0) return getUserById(id);

  const setClause = fields
    .map((field, index) => `${field} = $${index + 2}`)
    .join(", ");
  const values = fields.map((field) => (input as any)[field]);

  const row = await one<UserRow>(
    `UPDATE users SET ${setClause} WHERE user_id = $1 RETURNING *`,
    [id, ...values],
  );

  return row ? mapUser(row) : null;
}

export type Metrics = {
  questions: number;
  answers: number;
  likes: number;
  rating: number;
  engagement: number;
};

export async function getUserMetrics(user_id: UserID): Promise<Metrics> {
  const questions_row = await one<{ count: string }>(
    "SELECT COUNT(*) as count FROM questions WHERE user_id = $1",
    [user_id],
  );

  const answers_row = await one<{ count: string }>(
    "SELECT COUNT(*) as count FROM answers WHERE user_id = $1",
    [user_id],
  );

  const tutorials_row = await one<{ count: string }>(
    "SELECT COUNT(*) as count FROM tutorials WHERE user_id = $1",
    [user_id],
  );

  const comments_row = await one<{ count: string }>(
    "SELECT COUNT(*) as count FROM comments WHERE user_id = $1",
    [user_id],
  );

  const likes_row = await one<{ count: string }>(
    `SELECT COUNT(*) as count FROM interactions i
     WHERE i.interaction_type = 'react' AND i.value > 0 AND (
       i.question_id IN (SELECT question_id FROM questions WHERE user_id = $1) OR
       i.answer_id IN (SELECT answer_id FROM answers WHERE user_id = $1) OR
       i.tutorial_id IN (SELECT tutorial_id FROM tutorials WHERE user_id = $1)
     )`,
    [user_id],
  );

  const downvotes_row = await one<{ count: string }>(
    `SELECT COUNT(*) as count FROM interactions i
     WHERE i.interaction_type = 'react' AND i.value < 0 AND (
       i.question_id IN (SELECT question_id FROM questions WHERE user_id = $1) OR
       i.answer_id IN (SELECT answer_id FROM answers WHERE user_id = $1) OR
       i.tutorial_id IN (SELECT tutorial_id FROM tutorials WHERE user_id = $1)
     )`,
    [user_id],
  );

  const accepted_answers_row = await one<{ count: string }>(
    "SELECT COUNT(*) as count FROM answers WHERE user_id = $1 AND is_accepted = true",
    [user_id],
  );

  const tutorials_rating_row = await one<{ avg: string }>(
    "SELECT AVG(value) as avg FROM interactions WHERE tutorial_id IN (SELECT tutorial_id FROM tutorials WHERE user_id = $1) AND interaction_type = 'rating'",
    [user_id],
  );

  const questionsCount = Number(questions_row?.count || 0);
  const answersCount = Number(answers_row?.count || 0);
  const tutorialsCount = Number(tutorials_row?.count || 0);
  const commentsCount = Number(comments_row?.count || 0);
  const likesCount = Number(likes_row?.count || 0);
  const downvotesCount = Number(downvotes_row?.count || 0);
  const acceptedCount = Number(accepted_answers_row?.count || 0);
  const avgTutorialRating = Number(tutorials_rating_row?.avg || 0);

  const totalPositive = likesCount + acceptedCount * 3;
  const totalNegative = downvotesCount;
  const totalVotes = totalPositive + totalNegative;
  let voteRatio = totalVotes > 0 ? totalPositive / totalVotes : 0.5;

  if (avgTutorialRating > 0) {
    const tutorialRatio = (avgTutorialRating - 1) / 4;
    voteRatio = voteRatio * 0.7 + tutorialRatio * 0.3;
  }

  const rating = Math.round(Math.min(100, Math.max(0, voteRatio * 100)));

  const rawEngagement =
    tutorialsCount * 10 +
    answersCount * 5 +
    acceptedCount * 10 +
    questionsCount * 3 +
    commentsCount * 1;

  const engagement = Math.min(100, Math.round(rawEngagement / 2));

  return {
    questions: questionsCount,
    answers: answersCount,
    likes: likesCount,
    rating,
    engagement,
  };
}

export async function getTopContributorsThisWeek(limit: number = 5) {
  const rows = await q<UserRow & { engagement: string; weekly_acts: string }>(
    `SELECT u.*,
      u.credibility_score as engagement,
      (
        (SELECT COUNT(*) FROM questions q WHERE q.user_id = u.user_id AND q.created_at >= NOW() - INTERVAL '7 days') +
        (SELECT COUNT(*) FROM answers  a WHERE a.user_id = u.user_id AND a.created_at >= NOW() - INTERVAL '7 days') +
        (SELECT COUNT(*) FROM comments c WHERE c.user_id = u.user_id AND c.created_at >= NOW() - INTERVAL '7 days')
      ) as weekly_acts
     FROM users u
     ORDER BY weekly_acts DESC, engagement DESC
     LIMIT $1`,
    [limit],
  );

  return rows.map((r) => {
    const user = mapUser(r);
    return {
      ...user,
      engagement: Number(r.engagement),
      weekly_acts: Number(r.weekly_acts),
    };
  });
}

export async function getHeatmapData(userId: string, days: number = 90) {
  const rows = await q<{ date: string; count: string }>(
    `
    WITH dates AS (
      SELECT generate_series(
        (NOW() AT TIME ZONE 'Asia/Manila')::date - $2::interval,
        (NOW() AT TIME ZONE 'Asia/Manila')::date,
        '1 day'::interval
      )::date as date
    ),
    activity AS (
      SELECT DATE(created_at AT TIME ZONE 'Asia/Manila') as date, 1 as count FROM questions WHERE user_id = $1 AND created_at >= (NOW() AT TIME ZONE 'Asia/Manila')::date - $2::interval
      UNION ALL
      SELECT DATE(created_at AT TIME ZONE 'Asia/Manila') as date, 1 as count FROM answers WHERE user_id = $1 AND created_at >= (NOW() AT TIME ZONE 'Asia/Manila')::date - $2::interval
      UNION ALL
      SELECT DATE(created_at AT TIME ZONE 'Asia/Manila') as date, 1 as count FROM comments WHERE user_id = $1 AND created_at >= (NOW() AT TIME ZONE 'Asia/Manila')::date - $2::interval
    )
    SELECT d.date::text, COALESCE(SUM(a.count), 0) as count
    FROM dates d
    LEFT JOIN activity a ON d.date = a.date
    GROUP BY d.date
    ORDER BY d.date ASC
    `,
    [userId, `${days - 1} days`],
  );
  return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
}
