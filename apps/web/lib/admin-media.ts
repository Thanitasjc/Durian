/**
 * Admin media uploads should hit the Laravel API directly (not via Vercel rewrite)
 * so large files aren't truncated and S3/Supabase Storage receives the full body.
 */
export function getAdminMediaEndpoint(): string {
  const base = (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE ??
    ""
  )
    .trim()
    .replace(/\/$/, "");

  if (base) {
    return `${base}/api/v1/admin/media`;
  }

  // Browser fallback when env wasn't baked into the Vercel build
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("vercel.app") || host.includes("auragold")) {
      return "https://auragold-durian-api.onrender.com/api/v1/admin/media";
    }
  }

  return "/api/v1/admin/media";
}

/**
 * Old Render-disk paths that no longer exist after redeploy.
 * Do NOT treat Supabase `/storage/v1/...` (or absolute supabase URLs) as dead.
 */
export function isDeadLocalMediaUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.trim();
  if (u.startsWith("/storage/v1/")) return false;
  if (u.includes(".supabase.co/storage/")) return false;
  if (u.includes("storage.supabase.co")) return false;
  // Laravel public disk only
  return (
    u.startsWith("/storage/uploads/") ||
    /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/storage\//.test(u) ||
    /^https?:\/\/[^/]*onrender\.com\/storage\//.test(u)
  );
}
