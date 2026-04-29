import { generateToken, hashPassword } from "@/lib/auth";
import { ConflictError, errorToResponse, ValidationError } from "@/lib/errors";
import {
  getUserByEmail,
  getUserByUsername,
  insertUser,
} from "@/lib/queries/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_name,
      email,
      password,
      age,
      gender,
      institution,
      education_level,
    } = body;

    if (!user_name || !email || !password || !institution || !education_level) {
      throw new ValidationError("Required fields are missing");
    }

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      throw new ConflictError("Email already registered");
    }

    const existingUsername = await getUserByUsername(user_name);
    if (existingUsername) {
      throw new ConflictError("Username already taken");
    }

    const password_hash = await hashPassword(password);

    const newUser = await insertUser({
      user_name,
      email,
      password_hash,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      institution,
      education_level,
    });

    const { password_hash: _ph, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
        token: generateToken(newUser.user_id),
      },
      { status: 201 },
    );
  } catch (error) {
    return errorToResponse(error);
  }
}
