"use server";

import { redirect } from "next/navigation";
import { isManagerEmail } from "@/lib/auth/manager-access";
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
  const { data, error } = await supabase.auth.signInWithPassword(
    credentials.data,
  );

  if (error) {
    return { error: error.message };
  }

  if (isManagerEmail(data.user.email)) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw new Error(
        `Unable to end a manager session from user sign-in: ${signOutError.message}`,
      );
    }

    return {
      error: "This is the manager account. Please use the separate manager sign-in.",
    };
  }

  redirect("/");
}

export async function signInManager(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!credentials.success) {
    return {
      error:
        credentials.error.issues[0]?.message ?? "Check your manager sign-in details.",
    };
  }

  if (!process.env.WORKFLOW_MANAGER_EMAIL?.trim()) {
    return {
      error: "Manager sign-in is not configured. Contact the application owner.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(
    credentials.data,
  );

  if (error) {
    return { error: "The email or password is incorrect." };
  }

  if (!isManagerEmail(data.user.email)) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw new Error(
        `Unable to end a non-manager session: ${signOutError.message}`,
      );
    }

    return { error: "This account does not have manager access." };
  }

  redirect("/manager");
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

  if (isManagerEmail(credentials.data.email)) {
    return {
      error: "This email is reserved for the manager account. Use manager sign-up.",
    };
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

export async function signUpManager(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!credentials.success) {
    return {
      error:
        credentials.error.issues[0]?.message ?? "Check your manager sign-up details.",
    };
  }

  if (!process.env.WORKFLOW_MANAGER_EMAIL?.trim()) {
    return {
      error: "Manager sign-up is not configured. Contact the application owner.",
    };
  }

  if (!isManagerEmail(credentials.data.email)) {
    return {
      error: "Only the email configured for manager access can create this account.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    throw new Error("Set NEXT_PUBLIC_SITE_URL in .env before signing up.");
  }

  const callbackUrl = new URL("/auth/callback", siteUrl);
  callbackUrl.searchParams.set("next", "/manager/sign-in");

  const { data, error } = await supabase.auth.signUp({
    ...credentials.data,
    options: { emailRedirectTo: callbackUrl.toString() },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return {
      message:
        "Check the configured manager email for a confirmation link, then sign in on the manager sign-in page.",
    };
  }

  redirect("/manager");
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Unable to sign out: ${error.message}`);
  }

  redirect("/sign-in");
}
