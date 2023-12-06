import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
});

export type CreateNoteSchemea = z.infer<typeof createNoteSchema>;
