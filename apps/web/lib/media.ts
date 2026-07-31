/**
 * Normalize Laravel media URLs for the Next.js app.
 * - Relative /storage/... is proxied by next.config rewrites (local disk).
 * - Absolute http://127.0.0.1:8000/storage/... → /storage/... (next/image blocks private IPs).
 * - Cloud URLs (Supabase Storage / S3 / Unsplash) are left absolute.
 */
export function toPublicMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/storage/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname;
    if (
      (host === "127.0.0.1" || host === "localhost") &&
      parsed.pathname.startsWith("/storage/")
    ) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // not an absolute URL
  }

  return trimmed;
}

export function isLocalStorageUrl(url: string): boolean {
  return toPublicMediaUrl(url).startsWith("/storage/");
}
