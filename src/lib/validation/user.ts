import { z } from "zod";
import { ValidationError } from "@/lib/errors";

export const updateProfileSchema = z.object({
  user_name: z.string().min(3).max(100).optional(),
  institution: z.string().max(255).optional(),
  education_level: z
    .enum(["high_school", "bachelor", "master", "doctorate", "other"])
    .optional(),
  age: z.coerce.number().min(13).max(120).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first.path.length ? `${first.path.join(".")}: ` : "";
    throw new ValidationError(`${path}${first.message}`);
  }
  return result.data;
}
