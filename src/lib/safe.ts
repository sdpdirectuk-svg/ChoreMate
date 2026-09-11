/** Allow only same-origin relative paths (blocks //evil.com and absolute URLs). */
export function safeInternalPath(
  path: string | null | undefined,
  fallback = "/app",
): string {
  if (!path) return fallback;
  const value = path.trim();
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.includes("://")) return fallback;
  if (value.includes("\\")) return fallback;
  if (/[\x00-\x1f]/.test(value)) return fallback;
  return value;
}

export function publicErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!(error instanceof Error)) return fallback;
  const message = error.message.trim();
  if (!message) return fallback;
  // Avoid leaking infra / SQL / env details to end users.
  if (
    /supabase|postgres|jwt|service.role|env|ECONN|fetch failed|permission denied|row-level|rpc/i.test(
      message,
    )
  ) {
    return fallback;
  }
  return message;
}
