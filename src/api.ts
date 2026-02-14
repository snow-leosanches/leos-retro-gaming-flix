import type { Content, Video, VideoProvider } from './types/content'
import { resolveVimeoThumbnails } from './utils/thumbnail'

const CONTENT_URL = '/content.json'

let cache: Content | null = null

function withProvider(v: Video, provider: VideoProvider): Video {
  return { ...v, provider }
}

/** All videos from both youtube and vimeo arrays, with provider set */
function getAllVideos(content: Content): Video[] {
  const fromYoutube = content.youtube.map((v) => withProvider(v, 'youtube'))
  const fromVimeo = content.vimeo.map((v) => withProvider(v, 'vimeo'))
  return [...fromYoutube, ...fromVimeo]
}

/** YouTube videos in content order (last in content.json is last in list) */
export async function getYoutubeVideos(): Promise<Video[]> {
  const content = await getContent()
  return content.youtube.map((v) => withProvider(v, 'youtube'))
}

/** Vimeo videos in content order (last in content.json is last in list) */
export async function getVimeoVideos(): Promise<Video[]> {
  const content = await getContent()
  return content.vimeo.map((v) => withProvider(v, 'vimeo'))
}

/** Fisher–Yates shuffle; returns a new array in random order */
function shuffle<T>(array: T[]): T[] {
  const out = [...array]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = out[i]
    const b = out[j]
    if (a !== undefined && b !== undefined) {
      out[i] = b
      out[j] = a
    }
  }
  return out
}

export async function getContent(): Promise<Content> {
  if (cache) return cache
  const res = await fetch(CONTENT_URL)
  if (!res.ok) throw new Error('Failed to load content')
  cache = (await res.json()) as Content
  // Resolve Vimeo thumbnails via oEmbed before returning
  const allVideos = getAllVideos(cache)
  await resolveVimeoThumbnails(allVideos)
  // Write resolved thumbnails back into the cache
  for (const v of allVideos) {
    if (v.provider === 'vimeo') {
      const cached = cache.vimeo.find((c) => c.id === v.id)
      if (cached && v.thumbnail) cached.thumbnail = v.thumbnail
    }
  }
  return cache
}

/** Videos where featured === true, from both youtube and vimeo (random order) */
export async function getFeaturedVideos(): Promise<Video[]> {
  const content = await getContent()
  const featured = getAllVideos(content).filter((v) => v.featured === true)
  return shuffle(featured)
}

/** All videos from youtube and vimeo combined (random order) */
export async function getAllVideosList(): Promise<Video[]> {
  const content = await getContent()
  return shuffle(getAllVideos(content))
}

/** Returns a map of category (tag) -> videos, ordered by first appearance */
export async function getVideosByCategory(): Promise<Map<string, Video[]>> {
  const content = await getContent()
  const all = getAllVideos(content)
  const map = new Map<string, Video[]>()
  for (const v of all) {
    if (v.tags) {
      for (const tag of v.tags) {
        let list = map.get(tag)
        if (!list) {
          list = []
          map.set(tag, list)
        }
        list.push(v)
      }
    }
  }
  return map
}

export async function getVideoById(id: string): Promise<Video | null> {
  const content = await getContent()
  const all = getAllVideos(content)
  return all.find((v) => v.id === id) ?? null
}
