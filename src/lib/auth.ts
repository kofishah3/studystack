import 'server-only';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { one } from './db';
import type { User } from '@/types/database';

type UserID = User['user_id'];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: UserID): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return one<User>('SELECT * FROM users WHERE email = $1', [email]);
}

export async function createUser(userData: {
  user_name: string;
  email: string;
  password: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  institution: string;
  education_level: 'high_school' | 'bachelor' | 'master' | 'doctorate' | 'other';
}): Promise<User> {
  const password_hash = await hashPassword(userData.password);
  const row = await one<User>(
    `INSERT INTO users (user_id, user_name, email, password_hash, age, gender, institution, education_level)
     VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userData.user_name, userData.email, password_hash,
     userData.age, userData.gender, userData.institution, userData.education_level],
  );
  if (!row) throw new Error('createUser: no row returned');
  return row;
}
