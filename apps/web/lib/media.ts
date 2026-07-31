/**
 * Normalize media URLs for the Next.js app.
 * - Laravel local disk: /storage/uploads/... (proxied to API)
 * - Supabase Storage absolute URLs: keep as-is
 * - Accidental relative Supabase paths: /storage/v1/... → absolute host
 */
const SUPABASE_PUBLIC_HOST =
  process.env.NEXT_PUBLIC_SUPABASE_HOST ?? "anefnlhwarioumxdyrpa.supabase.co";

export function toPublicMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Relative Supabase public object path (missing host) — fix it
  if (trimmed.startsWith("/storage/v1/object/public/")) {
    return `https://${SUPABASE_PUBLIC_HOST}${trimmed}`;
  }

  // Laravel local public disk (NOT Supabase)
  if (trimmed.startsWith("/storage/uploads/") || trimmed === "/storage") {
    return trimmed;
  }
  if (trimmed.startsWith("/storage/") && !trimmed.startsWith("/storage/v1/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname;

    // Collapse localhost Laravel URLs for next/image
    if (
      (host === "127.0.0.1" || host === "localhost") &&
      parsed.pathname.startsWith("/storage/") &&
      !parsed.pathname.startsWith("/storage/v1/")
    ) {
      return `${parsed.pathname}${parsed.search}`;
    }

    // Already absolute (Supabase / Unsplash / S3) — keep
    return trimmed;
  } catch {
    return trimmed;
  }
}

export function isLocalStorageUrl(url: string): boolean {
  const normalized = toPublicMediaUrl(url);
  // Only true Laravel local disk paths (after normalization Supabase is absolute)
  return (
    normalized.startsWith("/storage/uploads/") ||
    (normalized.startsWith("/storage/") &&
      !normalized.startsWith("/storage/v1/") &&
      !normalized.startsWith("http"))
  );
}
