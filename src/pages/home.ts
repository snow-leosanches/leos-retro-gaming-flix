import type { Video } from '../types/content'
import { getFeaturedVideos, getAllVideosList } from '../api'
import { getThumbnailUrl } from '../utils/thumbnail'
import { enableCarouselDrag } from '../utils/carouselDrag'

type NavigateFn = (path: string, id?: string) => void

function header(_navigate: NavigateFn): HTMLElement {
  const el = document.createElement('header')
  el.className = 'site-header'
  el.innerHTML = `
    <a href="#/" class="logo" aria-label="Leo's Retro Gaming Flix - Home">Leo's Retro Gaming Flix</a>
    <nav class="nav">
      <a href="#/" class="nav-link active">Home</a>
    </nav>
  `
  return el
}

function escapeHtml(s: string): string {
  if (!s) return ''
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

function featuredCarousel(items: Video[], navigate: NavigateFn): HTMLElement {
  const section = document.createElement('section')
  section.className = 'carousel-section featured-section'
  section.innerHTML = '<h2 class="carousel-title">Featured</h2>'
  const track = document.createElement('div')
  track.className = 'carousel-track featured-track'
  for (const item of items) {
    const card = document.createElement('button')
    card.type = 'button'
    card.className = 'carousel-card featured-card'
    card.innerHTML = `
      <img src="${getThumbnailUrl(item)}" alt="" class="card-img" loading="lazy" />
      <div class="card-overlay">
        <span class="card-title">${escapeHtml(item.title)}</span>
        <span class="card-meta">${escapeHtml(item.duration ?? '')} · ${escapeHtml(item.year ?? '')}</span>
        <span class="card-play-label">Play</span>
      </div>
    `
    card.addEventListener('click', () => navigate('/video', item.id))
    track.appendChild(card)
  }
  section.appendChild(track)
  enableCarouselDrag(track)
  return section
}

function allContentCarousel(items: Video[], navigate: NavigateFn): HTMLElement {
  const section = document.createElement('section')
  section.className = 'carousel-section'
  section.innerHTML = '<h2 class="carousel-title">All Content</h2>'
  const track = document.createElement('div')
  track.className = 'carousel-track'
  for (const item of items) {
    const card = document.createElement('button')
    card.type = 'button'
    card.className = 'carousel-card'
    card.innerHTML = `
      <img src="${getThumbnailUrl(item)}" alt="" class="card-img" loading="lazy" />
      <div class="card-overlay">
        <span class="card-title">${escapeHtml(item.title)}</span>
        <span class="card-meta">${escapeHtml(item.duration ?? '')}</span>
      </div>
    `
    card.addEventListener('click', () => navigate('/video', item.id))
    track.appendChild(card)
  }
  section.appendChild(track)
  enableCarouselDrag(track)
  return section
}

export async function renderHome(
  container: HTMLElement,
  { navigate }: { navigate: NavigateFn }
): Promise<void> {
  container.innerHTML = ''
  container.appendChild(header(navigate))

  const main = document.createElement('main')
  main.className = 'main-content'

  try {
    const [featured, all] = await Promise.all([
      getFeaturedVideos(),
      getAllVideosList(),
    ])
    main.appendChild(featuredCarousel(featured, navigate))
    main.appendChild(allContentCarousel(all, navigate))
  } catch {
    main.innerHTML = `<p class="error-message">Could not load content. Make sure content.json is available.</p>`
  }

  container.appendChild(main)
}
