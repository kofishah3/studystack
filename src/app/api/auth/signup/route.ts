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
      user_name: initial_user_name,
      email,
      password,
      age,
      gender,
      institution: initial_institution,
      education_level: initial_education_level,
    } = body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      throw new ConflictError("Email already registered");
    }

    let user_name = initial_user_name;
    if (!user_name) {
      const emailPrefix = email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      user_name = `${emailPrefix}${randomSuffix}`;

      const existingUsername = await getUserByUsername(user_name);
      if (existingUsername) {
        user_name = `${emailPrefix}${randomSuffix}${Math.floor(Math.random() * 100)}`;
      }
    } else {
      const existingUsername = await getUserByUsername(user_name);
      if (existingUsername) {
        throw new ConflictError("Username already taken");
      }
    }

    const password_hash = await hashPassword(password);

    const newUser = await insertUser({
      user_name,
      email,
      password_hash,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      institution: initial_institution || "Pending...",
      education_level: (initial_education_level as any) || "other",
      profile_url: null,
      credibility_score: 0,
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
