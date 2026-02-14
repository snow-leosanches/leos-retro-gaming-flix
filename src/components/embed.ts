import type { Video } from '../types/content'

/**
 * Renders YouTube or Vimeo embed into container.
 */
export function embedPlayer(container: HTMLElement, video: Video): void {
  container.innerHTML = ''
  if (video.provider === 'vimeo') {
    const iframe = document.createElement('iframe')
    iframe.src = `https://player.vimeo.com/video/${video.videoId}?autoplay=1`
    iframe.title = video.title
    iframe.allow = 'autoplay; fullscreen; picture-in-picture'
    iframe.allowFullscreen = true
    iframe.className = 'embed-iframe'
    container.appendChild(iframe)
  } else {
    const iframe = document.createElement('iframe')
    iframe.src = `https://www.youtube.com/embed/${video.videoId}?autoplay=1`
    iframe.title = video.title
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    iframe.allowFullscreen = true
    iframe.className = 'embed-iframe'
    container.appendChild(iframe)
  }
}
