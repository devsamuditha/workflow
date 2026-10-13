import "server-only";

export function isManagerEmail(email: string | undefined): boolean {
  const configuredEmail = process.env.WORKFLOW_MANAGER_EMAIL?.trim();
  return Boolean(
    configuredEmail &&
      email &&
      configuredEmail.toLowerCase() === email.trim().toLowerCase(),
  );
}
