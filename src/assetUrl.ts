/** Public asset path respecting Vite `base` (e.g. `/swift-client/` on GitHub Pages). */
export function assetUrl(path: string): string {
  const trimmed = path.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${trimmed}`;
}
