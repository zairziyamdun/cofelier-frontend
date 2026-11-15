// Куда вернуть после входа: только свой относительный путь, без открытого
// редиректа на чужой сайт (//evil.com, https://…).
export function safeRedirectPath(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}
