// ── Image URL resolver ───────────────────────────────────────────────
// Resolves relative image paths (e.g. /uploads/general/xxx.jpg) to
// full URLs using the API base URL. Absolute URLs are passed through.

const API_URL = import.meta.env.VITE_API_URL as string; // e.g. http://localhost:8080/api

/**
 * Resolve an image URL that might be relative to the backend.
 * - `/uploads/general/xxx.jpg` → `http://localhost:8080/api/uploads/general/xxx.jpg`
 * - `https://...` → returned as-is
 * - `null` / `undefined` / `''` → returns fallback
 */
export function resolveImageUrl(url: string | null | undefined, fallback = ''): string {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${API_URL}${url}`;
  }
  return url;
}
