import { withAuth, type AuthedRequest } from "@/lib/auth";
import { errorToResponse } from "@/lib/errors";
import { updateUser, getUserById } from "@/lib/queries/users";
import { parseOrThrow, updateProfileSchema } from "@/lib/validation/user";
import { getStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export const POST = withAuth(async (req: AuthedRequest) => {
  try {
    const contentType = req.headers.get("content-type") || "";
    let data: any = {};
    let profileUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      const jsonStr = formData.get("data") as string;
      if (jsonStr) {
        data = JSON.parse(jsonStr);
      }

      const file = formData.get("profile_image") as File;
      if (file && file.size > 0) {
        const storage = getStorage();
        const buffer = Buffer.from(await file.arrayBuffer());
        const key = `profiles/${req.userId}/${Date.now()}-${file.name}`;
        await storage.put({
          key,
          buffer,
          mimeType: file.type,
        });
        profileUrl = await storage.getUrl(key, { expiresIn: 31536000 });
      }
    } else {
      data = await req.json();
    }

    const validated = parseOrThrow(updateProfileSchema, data);

    const updateData: any = { ...validated };
    if (profileUrl) {
      updateData.profile_url = profileUrl;
    }

    const updatedUser = await updateUser(req.userId, updateData);

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    return errorToResponse(error);
  }
});
