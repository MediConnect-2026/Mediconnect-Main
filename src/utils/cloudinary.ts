/**
 * Cloudinary image optimization utility
 * Optimized for visual quality AND performance
 */

// ─── Memoization cache ────────────────────────────────────────────────────────
const _cache = new Map<string, string>();

export type CloudinaryOptions = {
  width?: number;
  height?: number;
  quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | number;
  format?: "auto" | "webp" | "avif";
  fit?: "fill" | "scale" | "crop" | "thumb" | "pad";
  /**
   * Sharpening is opt-in — it runs CPU on Cloudinary's side per request.
   * Only set it when images genuinely need it (photos, not logos/vectors).
   * Range 0–400. Recommended: 30–60.
   */
  sharpen?: number;
  /**
   * Adds fl_progressive for JPEGs → browser shows blurry preview
   * while the full image loads. Defaults to true.
   */
  progressive?: boolean;
  /**
   * Adds fl_immutable_cache → CDN never revalidates (use with versioned URLs).
   */
  immutable?: boolean;
};

export function cl(url: string, options: CloudinaryOptions = {}): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  // ── Cache lookup ─────────────────────────────────────────────────────────
  const cacheKey = url + JSON.stringify(options);
  const cached = _cache.get(cacheKey);
  if (cached) return cached;

  const {
    width,
    height,
    quality = "auto:good",
    format = "auto",
    fit = "fill",
    sharpen,
    progressive = true,
    immutable = false,
  } = options;

  const transforms: string[] = [
    `f_${format}`,
    `q_${quality}`,
    // Progressive JPEG: browser renders a blurry preview immediately,
    // then sharpens as data arrives — perceived load feels faster.
    progressive ? "fl_progressive" : null,
    // Immutable cache: tells the CDN the asset never changes.
    // Use only with content-hashed / versioned Cloudinary URLs.
    immutable ? "fl_immutable_cache" : null,
    // Sharpen is opt-in: set explicitly per preset that needs it.
    sharpen != null && sharpen > 0 ? `e_sharpen:${sharpen}` : null,
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
    width || height ? `c_${fit}` : null,
    // ↓ Removed `dpr_auto` — it only works with Cloudinary's JS SDK
    //   (it reads a cookie set by cloudinary-core). Without the SDK it
    //   silently falls back to DPR 1. For retina support, either:
    //   a) use clSrcSet() below, or
    //   b) explicitly pass dpr: 2 for critical above-the-fold images.
  ].filter(Boolean) as string[];

  const result = url.replace("/upload/", `/upload/${transforms.join(",")}/`);
  _cache.set(cacheKey, result);
  return result;
}

// ─── Responsive srcset helper ─────────────────────────────────────────────────
/**
 * Generates a `srcset` string for responsive images.
 * Lets the browser pick the right size for the current viewport + DPR —
 * far more effective than a single large image or `dpr_auto`.
 *
 * @example
 * <img
 *   src={clCard(url)}
 *   srcSet={clSrcSet(url, [400, 800, 1200, 1600])}
 *   sizes="(max-width: 640px) 100vw, 50vw"
 * />
 */
export function clSrcSet(
  url: string,
  widths: number[],
  options: Omit<CloudinaryOptions, "width"> = {},
): string {
  return widths
    .map((w) => `${cl(url, { ...options, width: w })} ${w}w`)
    .join(", ");
}

// ─── Presets ──────────────────────────────────────────────────────────────────

/** Cards: features, benefits, services */
export const clCard = (url: string) =>
  cl(url, { width: 800, quality: "auto:good", sharpen: 40 });

export const clCardSrcSet = (url: string) =>
  clSrcSet(url, [400, 800, 1200], { quality: "auto:good", sharpen: 40 });

/** Full-screen hero */
export const clHero = (url: string) =>
  cl(url, { width: 1920, quality: "auto:best", sharpen: 30 });

export const clHeroSrcSet = (url: string) =>
  clSrcSet(url, [768, 1280, 1920], { quality: "auto:good", sharpen: 30 });

/** Small thumbnails: avatars, flags */
export const clThumb = (url: string) =>
  cl(url, { width: 200, quality: "auto:good", sharpen: 30 });

/** Full-bleed, no fixed size */
export const clFull = (url: string) => cl(url, { quality: "auto:good" });

/** Logos — no sharpening (avoids raster artifacts on vector exports) */
export const clLogo = (url: string) =>
  cl(url, { width: 256, quality: "auto:best" });

/** Background sections */
export const clBg = (url: string, isMobile = false) =>
  cl(url, {
    width: isMobile ? 768 : 1920, // was 1200/2800 — trimmed >30% bytes
    quality: "auto:eco", // backgrounds don't need "good"
    sharpen: 20,
  });

/** Portrait / user photos */
export const clPortrait = (url: string, isMobile = false) =>
  cl(url, {
    width: isMobile ? 600 : 1200, // was 1000/1800
    quality: "auto:good",
    sharpen: 40,
  });

/** How It Works steps */
export const clStep = (url: string, isMobile = false) =>
  cl(url, {
    width: isMobile ? 768 : 1440, // was 1200/2400
    quality: "auto:good",
    sharpen: 30,
  });
