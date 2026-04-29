import 'server-only';
import { q, one } from '@/lib/db';
import { asUserId } from '@/lib/db-brands';
import type { User, UserID } from '@/types/database';

type UserRow = Omit<User, 'user_id'> & { user_id: string };

function mapUser(r: UserRow): User {
  return { ...r, user_id: asUserId(r.user_id) };
}

export async function getUserById(id: UserID): Promise<User | null> {
  const row = await one<UserRow>('SELECT * FROM users WHERE user_id = $1', [id]);
  return row ? mapUser(row) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const row = await one<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
  return row ? mapUser(row) : null;
}

export async function insertUser(
  input: Omit<User, 'user_id' | 'created_at'>,
): Promise<User> {
  const row = await one<UserRow>(
    `INSERT INTO users
       (user_id, user_name, email, password_hash, age, gender, institution, education_level)
     VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [input.user_name, input.email, input.password_hash,
     input.age, input.gender, input.institution, input.education_level],
  );
  if (!row) throw new Error('insertUser: no row returned');
  return mapUser(row);
}
