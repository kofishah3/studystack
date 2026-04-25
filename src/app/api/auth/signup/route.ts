// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_name, email, password, age, gender, institution, education_level } = body;
    
    // Basic validation
    if (!user_name || !email || !password || !age || !gender || !institution || !education_level) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingEmail = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }
    
    // Check if username already exists
    const existingUsername = await query(
      'SELECT * FROM users WHERE user_name = $1',
      [user_name]
    );
    
    if (existingUsername.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }
    
    // Hash password
    const password_hash = await hashPassword(password);
    
    // Create user
    const result = await query(
      `INSERT INTO users (user_id, user_name, email, password_hash, age, gender, institution, education_level)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id, user_name, email, institution, age, gender, education_level, created_at`,
      [user_name, email, password_hash, parseInt(age), gender, institution, education_level]
    );
    
    const newUser = result.rows[0];
    
    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}