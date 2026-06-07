/**
 * Prefix a site-relative path with the Astro base URL.
 * Works in both .astro files and React/Vite modules.
 *
 * Examples (base = "/power-wash-2-texts/"):
 *   siteUrl("/")                      → "/power-wash-2-texts/"
 *   siteUrl("/level/shooting-gallery") → "/power-wash-2-texts/level/shooting-gallery"
 */
export function siteUrl(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  // Strip duplicate leading slashes that would appear if path already starts with base
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}
