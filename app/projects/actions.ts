"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { withUserDatabase } from "@/lib/db/with-user-database";
import { projectSchema } from "@/schemas/project";

export type ProjectActionState = {
  error?: string;
  success?: boolean;
};

export async function createProject(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Unable to verify the current user: ${authError.message}`);
  }

  if (!user) {
    return { error: "Please sign in before adding a project." };
  }

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    status: formData.get("status"),
    priority: formData.get("priority"),
    startDate: formData.get("startDate") ?? "",
    dueDate: formData.get("dueDate") ?? "",
    progress: formData.get("progress"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Please check the project details and try again.",
    };
  }

  await withUserDatabase(user.id, (transaction) =>
    transaction.project.create({
      data: {
        ...parsed.data,
        ownerId: user.id,
      },
    }),
  );

  revalidatePath("/");
  return { success: true };
}
