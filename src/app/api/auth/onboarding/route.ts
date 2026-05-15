import { withAuth } from "@/lib/auth";
import { errorToResponse, ValidationError } from "@/lib/errors";
import { updateUser, getUserByUsername } from "@/lib/queries/users";
import { NextResponse } from "next/server";

export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const { user_name, institution, education_level, degree_program, age, gender } = body;
    const isCollegeLevel = ["bachelor", "master", "doctorate"].includes(education_level);

    if (!user_name || !institution || !education_level || (isCollegeLevel && !degree_program)) {
      throw new ValidationError("Required fields are missing");
    }

    const existingUser = await getUserByUsername(user_name);
    if (existingUser && existingUser.user_id !== req.userId) {
      throw new ValidationError("Username already taken");
    }

    const updatedUser = await updateUser(req.userId, {
      user_name,
      institution,
      education_level,
      degree_program: degree_program || null,
      age: age ? parseInt(age) : null,
      gender: gender || null,
    });

    if (!updatedUser) {
      throw new ValidationError("User not found");
    }

    const { password_hash, ...userWithoutPassword } = updatedUser as any;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    return errorToResponse(error);
  }
});
