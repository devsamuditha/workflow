import { z } from "zod";

export const projectSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a project name.").max(120),
    description: z
      .string()
      .trim()
      .max(2000, "Description must be 2,000 characters or fewer.")
      .transform((value) => value || null),
    status: z.enum(["TARGET", "PENDING", "ONGOING", "COMPLETED"]),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
    startDate: z
      .union([z.iso.date(), z.literal("")])
      .transform((value) =>
        value ? new Date(`${value}T00:00:00.000Z`) : null,
      ),
    dueDate: z
      .union([z.iso.date(), z.literal("")])
      .transform((value) =>
        value ? new Date(`${value}T00:00:00.000Z`) : null,
      ),
    progress: z.coerce.number().int().min(0).max(100),
  })
  .refine(
    ({ startDate, dueDate }) =>
      !startDate || !dueDate || startDate <= dueDate,
    {
      message: "The deadline must be on or after the start date.",
      path: ["dueDate"],
    },
  );
