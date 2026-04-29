import { NextRequest, NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { ValidationError, ConflictError, errorToResponse } from '@/lib/errors';
import type { User } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_name, email, password, age, gender, institution, education_level } = body;

    if (!user_name || !email || !password || !age || !gender || !institution || !education_level) {
      throw new ValidationError('All fields are required');
    }

    const existingEmail = await one<User>('SELECT * FROM users WHERE email = $1', [email]);
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    const existingUsername = await one<User>('SELECT * FROM users WHERE user_name = $1', [user_name]);
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    const password_hash = await hashPassword(password);

    const newUser = await one<User>(
      `INSERT INTO users (user_id, user_name, email, password_hash, age, gender, institution, education_level)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id, user_name, email, institution, age, gender, education_level, created_at`,
      [user_name, email, password_hash, parseInt(age), gender, institution, education_level],
    );

    return NextResponse.json({
      success: true,
      user: newUser,
      token: generateToken(newUser!.user_id),
    }, { status: 201 });
  } catch (error) {
    return errorToResponse(error);
  }
}
