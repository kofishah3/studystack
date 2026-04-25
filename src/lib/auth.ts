// lib/auth.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from './db';
import type { User } from '@/types/database';

type UserID = User['user_id'];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(userId: UserID): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query(  // Remove the <User> generic
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;  // Type assertion happens here
}

// Create new user
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
  
  const result = await query(
    `INSERT INTO users (user_id, user_name, email, password_hash, age, gender, institution, education_level)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      userData.user_name,
      userData.email,
      password_hash,
      userData.age,
      userData.gender,
      userData.institution,
      userData.education_level
    ]
  );
  
  return result.rows[0] as User;  // Use 'as User' for type assertion
}