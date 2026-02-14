export type VideoProvider = 'youtube' | 'vimeo'

export interface Video {
  id: string
  title: string
  description: string
  provider: VideoProvider
  videoId: string
  thumbnail?: string
  duration?: string
  year?: string
  /** When true, shown in the Featured carousel on the home page */
  featured?: boolean
  tags?: string[]
}

export interface Content {
  youtube: Video[]
  vimeo: Video[]
}
