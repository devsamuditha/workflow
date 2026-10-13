"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { withUserDatabase } from "@/lib/db/with-user-database";
import { reminderSchema } from "@/schemas/reminder";

export type ReminderActionState = {
  error?: string;
  success?: boolean;
};

export async function createReminder(
  _previousState: ReminderActionState,
  formData: FormData,
): Promise<ReminderActionState> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Unable to verify the current user: ${authError.message}`);
  }

  if (!user) {
    return { error: "Please sign in before adding a reminder." };
  }

  const parsed = reminderSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Please check the reminder details and try again.",
    };
  }

  await withUserDatabase(user.id, (transaction) =>
    transaction.reminder.create({
      data: {
        ...parsed.data,
        date: new Date(`${parsed.data.date}T00:00:00.000Z`),
        ownerId: user.id,
      },
    }),
  );

  revalidatePath("/");
  return { success: true };
}

export async function deleteReminder(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Unable to verify the current user: ${authError.message}`);
  }

  if (!user) {
    throw new Error("Please sign in before deleting a reminder.");
  }

  const id = formData.get("id");
  if (typeof id !== "string" || !z.string().uuid().safeParse(id).success) {
    throw new Error("A valid reminder is required.");
  }

  const deleted = await withUserDatabase(user.id, (transaction) =>
    transaction.reminder.deleteMany({
      where: { id, ownerId: user.id },
    }),
  );

  if (deleted.count !== 1) {
    throw new Error("The reminder could not be found.");
  }

  revalidatePath("/");
}
