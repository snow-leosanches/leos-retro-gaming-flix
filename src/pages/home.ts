import type { Video } from '../types/content'
import { getVideosByCategory, getAllVideosList } from '../api'
import { getThumbnailUrl } from '../utils/thumbnail'
import { enableCarouselDrag } from '../utils/carouselDrag'
import { getUser } from '../user-state'

type NavigateFn = (path: string, id?: string) => void

function header(navigate: NavigateFn): HTMLElement {
  const user = getUser()
  const el = document.createElement('header')
  el.className = 'site-header'
  el.innerHTML = `
    <a href="#/" class="logo" aria-label="Leo's Retro Gaming Flix - Home">Leo's Retro Gaming Flix</a>
    <nav class="nav">
      <a href="#/" class="nav-link active">Home</a>
      ${user
        ? `<a href="#/profile" class="nav-link nav-user" title="${user.email}">${user.name || user.email}</a>`
        : `<a href="#/login" class="nav-link">Sign In</a>`
      }
    </nav>
  `
  if (user) {
    el.querySelector<HTMLAnchorElement>('a[href="#/profile"]')!.addEventListener('click', (e) => {
      e.preventDefault()
      navigate('profile')
    })
  } else {
    el.querySelector<HTMLAnchorElement>('a[href="#/login"]')!.addEventListener('click', (e) => {
      e.preventDefault()
      navigate('login')
    })
  }
  return el
}

function escapeHtml(s: string): string {
  if (!s) return ''
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

function categoryCarousel(
  title: string,
  items: Video[],
  navigate: NavigateFn,
  options: { featured?: boolean } = {}
): HTMLElement {
  const section = document.createElement('section')
  section.className = options.featured
    ? 'carousel-section featured-section'
    : 'carousel-section'
  section.innerHTML = `<h2 class="carousel-title">${escapeHtml(title)}</h2>`
  const track = document.createElement('div')
  track.className = options.featured ? 'carousel-track featured-track' : 'carousel-track'
  for (const item of items) {
    const card = document.createElement('button')
    card.type = 'button'
    card.className = options.featured ? 'carousel-card featured-card' : 'carousel-card'
    card.innerHTML = `
      <img src="${getThumbnailUrl(item)}" alt="" class="card-img" loading="lazy" />
      <div class="card-overlay">
        <span class="card-title">${escapeHtml(item.title)}</span>
        <span class="card-meta">${escapeHtml(item.duration ?? '')}${item.year ? ` · ${escapeHtml(item.year)}` : ''}</span>
        ${options.featured ? '<span class="card-play-label">Play</span>' : ''}
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
    const [categories, all] = await Promise.all([
      getVideosByCategory(),
      getAllVideosList(),
    ])
    let first = true
    for (const [category, videos] of categories) {
      main.appendChild(categoryCarousel(category, videos, navigate, { featured: first }))
      first = false
    }
    main.appendChild(categoryCarousel('All Videos', all, navigate))
  } catch {
    main.innerHTML = `<p class="error-message">Could not load content. Make sure content.json is available.</p>`
  }

  container.appendChild(main)
}
