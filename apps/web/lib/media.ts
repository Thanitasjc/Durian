/**
 * Normalize media URLs for the Next.js app.
 * Always expand Supabase public object paths to an absolute host.
 */

const SUPABASE_PUBLIC_ORIGIN =
  "https://anefnlhwarioumxdyrpa.supabase.co";

export function toPublicMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed) return "";

  // Same-origin / absolute URL whose path is a Supabase public object
  try {
    const parsed = new URL(trimmed, SUPABASE_PUBLIC_ORIGIN);
    if (parsed.pathname.startsWith("/storage/v1/object/public/")) {
      // Force Supabase host (covers relative, vercel.app, localhost, etc.)
      return `${SUPABASE_PUBLIC_ORIGIN}${parsed.pathname}${parsed.search}`;
    }

    // Collapse localhost Laravel URLs for next/image
    if (
      (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost") &&
      parsed.pathname.startsWith("/storage/")
    ) {
      return `${parsed.pathname}${parsed.search}`;
    }

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
  } catch {
    // fall through
  }

  // Relative Supabase path
  if (trimmed.startsWith("/storage/v1/object/public/")) {
    return `${SUPABASE_PUBLIC_ORIGIN}${trimmed}`;
  }

  // Laravel local public disk
  if (trimmed.startsWith("/storage/")) {
    return trimmed;
  }

  return trimmed;
}

export function isLocalStorageUrl(url: string): boolean {
  const normalized = toPublicMediaUrl(url);
  return (
    normalized.startsWith("/storage/") &&
    !normalized.startsWith("/storage/v1/") &&
    !normalized.startsWith("http")
  );
}
