import { NextRequest, NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { ValidationError, AuthError, errorToResponse } from '@/lib/errors';
import type { User } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await one<User>('SELECT * FROM users WHERE email = $1', [email]);

    if (!user) {
      throw new AuthError();
    }

    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      throw new AuthError();
    }

    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token: generateToken(user.user_id),
    });
  } catch (error) {
    return errorToResponse(error);
  }
}
