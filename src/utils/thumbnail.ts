import type { Video } from '../types/content'

/** Neutral fallback when a custom thumbnail URL fails to load */
export const PLACEHOLDER_THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect fill='%231a1a1a' width='320' height='180'/%3E%3Ctext fill='%23666' font-family='system-ui,sans-serif' font-size='14' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3ENo thumbnail%3C/text%3E%3C/svg%3E"

/**
 * Builds a data-URI SVG placeholder that shows the video title.
 * Used so we don't depend on YouTube's image CDN (which often 404s or blocks from localhost).
 */
function makeTitlePlaceholder(title: string): string {
  const safe = encodeURIComponent(
    title.length > 40 ? title.slice(0, 37) + '…' : title
  ).replace(/'/g, '%27')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#2a1a1a"/><stop offset="100%" style="stop-color:#1a0d0d"/></linearGradient></defs><rect width="320" height="180" fill="url(%23g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23e50914" font-family="system-ui,sans-serif" font-size="14" font-weight="bold">${safe}</text></svg>`
  return 'data:image/svg+xml,' + encodeURIComponent(svg)
}

/**
 * Returns a thumbnail URL for a video item.
 * For YouTube we use the public img.youtube.com CDN which serves thumbnails
 * reliably from any origin. For Vimeo we use item.thumbnail if set.
 */
export function getThumbnailUrl(item: Video): string {
  if (item.provider === 'youtube') {
    return item.thumbnail?.trim()
      ? item.thumbnail
      : `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`
  }
  return item.thumbnail?.trim() ? item.thumbnail : makeTitlePlaceholder(item.title)
}

/**
 * Fetches a Vimeo thumbnail URL via the public oEmbed API (no API key needed).
 * Returns null if the fetch fails.
 */
async function fetchVimeoThumbnail(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.thumbnail_url ?? null
  } catch {
    return null
  }
}

/**
 * Resolves Vimeo thumbnails for all Vimeo videos that don't have one set.
 * Mutates the video objects in place for caching efficiency.
 */
export async function resolveVimeoThumbnails(videos: Video[]): Promise<void> {
  const needsThumbnail = videos.filter(
    (v) => v.provider === 'vimeo' && !v.thumbnail?.trim()
  )
  if (needsThumbnail.length === 0) return

  const results = await Promise.all(
    needsThumbnail.map((v) => fetchVimeoThumbnail(v.videoId))
  )
  for (let i = 0; i < needsThumbnail.length; i++) {
    const thumb = results[i]
    if (thumb) {
      needsThumbnail[i]!.thumbnail = thumb
    }
  }
}
