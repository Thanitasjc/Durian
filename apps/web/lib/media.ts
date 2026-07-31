/**
 * Normalize Laravel media URLs for the Next.js app.
 * Absolute http://127.0.0.1:8000/storage/... breaks next/image (private IP → 400).
 * Relative /storage/... is proxied by next.config rewrites.
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
    if (parsed.pathname.startsWith("/storage/")) {
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
