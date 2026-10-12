"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { credentialsSchema } from "@/schemas/auth";

export type AuthActionState = {
  error?: string;
  message?: string;
};

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!credentials.success) {
    return { error: credentials.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(credentials.data);

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!credentials.success) {
    return { error: credentials.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await getSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    throw new Error("Set NEXT_PUBLIC_SITE_URL in .env before signing up.");
  }

  const { data, error } = await supabase.auth.signUp({
    ...credentials.data,
    options: { emailRedirectTo: new URL("/auth/callback", siteUrl).toString() },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return {
      message: "Check your email for a confirmation link, then sign in.",
    };
  }

  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Unable to sign out: ${error.message}`);
  }

  redirect("/sign-in");
}
