import { z } from "zod";

export const createCommentSchema = z
  .object({
    content: z.string().min(1).max(2000),
    parent_comment_id: z.number().nullable().optional(),
    question_id: z.string().nullable().optional(),
    answer_id: z.number().nullable().optional(),
    tutorial_id: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      const count = [data.question_id, data.answer_id, data.tutorial_id].filter(
        (id) => id != null,
      ).length;
      return count === 1;
    },
    {
      message:
        "Exactly one of question_id, answer_id, or tutorial_id must be provided.",
    },
  );

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export function parseOrThrow<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}
