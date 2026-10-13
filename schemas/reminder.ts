import { z } from "zod";

export const reminderSchema = z.object({
  title: z.string().trim().min(1, "Enter a reminder title.").max(120),
  description: z
    .string()
    .trim()
    .max(1000, "Notes must be 1,000 characters or fewer.")
    .transform((value) => value || null),
  date: z.iso.date(),
});
