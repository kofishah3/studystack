import { generateToken, verifyPassword } from "@/lib/auth";
import { AuthError, errorToResponse, ValidationError } from "@/lib/errors";
import { getUserByEmail } from "@/lib/queries/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const user = await getUserByEmail(email);

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
