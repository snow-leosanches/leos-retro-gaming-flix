import { getVideoById } from '../api'
import { getThumbnailUrl } from '../utils/thumbnail'
import { embedPlayer } from '../components/embed'
import { startMediaTracking } from '../analytics/snowplow'
import { getUser } from '../user-state'

type NavigateFn = (path: string, id?: string) => void

function escapeHtml(s: string): string {
  if (!s) return ''
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

export async function renderDetail(
  container: HTMLElement,
  id: string,
  _ctx: { navigate: NavigateFn }
): Promise<void> {
  container.innerHTML = ''
  const video = await getVideoById(id)
  if (!video) {
    container.innerHTML = `
      <header class="site-header"><a href="#/" class="logo">Leo's Retro Gaming Flix</a></header>
      <main class="detail-content"><p class="error-message">Video not found.</p><a href="#/">Back to Home</a></main>
    `
    return
  }

  const user = getUser()
  const headerEl = document.createElement('header')
  headerEl.className = 'site-header'
  headerEl.innerHTML = `
    <a href="#/" class="logo">Leo's Retro Gaming Flix</a>
    <nav class="nav">
      <a href="#/" class="nav-link">Home</a>
      ${user
        ? `<a href="#/profile" class="nav-link nav-user" title="${user.email}">${escapeHtml(user.name || user.email)}</a>`
        : `<a href="#/login" class="nav-link">Sign In</a>`
      }
    </nav>
  `

  const thumbUrl = getThumbnailUrl(video)
  const main = document.createElement('main')
  main.className = 'detail-content'
  main.innerHTML = `
    <div class="detail-hero" style="--thumb: url('${thumbUrl}')">
      <div class="detail-hero-backdrop"></div>
      <div class="detail-hero-info">
        <h1 class="detail-title">${escapeHtml(video.title)}</h1>
        <p class="detail-meta">${escapeHtml(video.duration ?? '')}${video.year ? ' · ' + escapeHtml(video.year) : ''}</p>
        <p class="detail-description">${escapeHtml(video.description)}</p>
        <button type="button" class="btn-play" id="btn-play">
          <span class="btn-play-icon" aria-hidden="true"></span>
          Play
        </button>
      </div>
    </div>
  `

  container.appendChild(headerEl)
  container.appendChild(main)

  const btnPlay = document.getElementById('btn-play')
  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      const playerContainer = document.createElement('div')
      playerContainer.className = 'fullscreen-player'
      playerContainer.innerHTML = `
        <button type="button" class="fullscreen-close" aria-label="Close">×</button>
        <div class="fullscreen-embed" id="fullscreen-embed"></div>
      `
      document.body.appendChild(playerContainer)
      const embedEl = document.getElementById('fullscreen-embed')
      let mediaTracking: ReturnType<typeof startMediaTracking> | null = null
      if (embedEl) {
        embedPlayer(embedEl, video)
        const iframe = embedEl.querySelector<HTMLIFrameElement>('iframe')
        if (iframe) {
          mediaTracking = startMediaTracking(iframe, video.provider, { label: video.title })
        }
      }
      const close = playerContainer.querySelector<HTMLButtonElement>('.fullscreen-close')
      function closePlayer(): void {
        mediaTracking?.endTracking()
        if (document.body.contains(playerContainer)) {
          document.body.removeChild(playerContainer)
        }
        close?.removeEventListener('click', closePlayer)
        document.removeEventListener('keydown', onKey)
      }
      function onKey(e: KeyboardEvent): void {
        if (e.key === 'Escape') closePlayer()
      }
      close?.addEventListener('click', closePlayer)
      document.addEventListener('keydown', onKey)
    })
  }
}
