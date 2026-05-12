import { one } from "@/lib/db";
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
       (user_id, user_name, email, password_hash, age, gender, institution, education_level)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.user_name,
      input.email,
      input.password_hash,
      input.age,
      input.gender,
      input.institution,
      input.education_level,
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

  const likes_row = await one<{ count: string }>(
    `SELECT COUNT(*) as count FROM interactions i
     WHERE i.interaction_type = 'react' AND i.value > 0 AND (
       i.question_id IN (SELECT question_id FROM questions WHERE user_id = $1) OR
       i.answer_id IN (SELECT answer_id FROM answers WHERE user_id = $1) OR
       i.tutorial_id IN (SELECT tutorial_id FROM tutorials WHERE user_id = $1)
     )`,
    [user_id],
  );

  const user = await getUserById(user_id);
  const questionsCount = Number(questions_row?.count || 0);
  const answersCount = Number(answers_row?.count || 0);
  const likesCount = Number(likes_row?.count || 0);
  const rating = user?.credibility_score || 0;

  const engagement = Math.min(
    100,
    Math.round((questionsCount * 3 + answersCount * 5 + likesCount) / 2),
  );

  return {
    questions: questionsCount,
    answers: answersCount,
    likes: likesCount,
    rating,
    engagement,
  };
}
