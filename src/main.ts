import './styles.css'
import { initRouter, navigate } from './router'
import { renderHome } from './pages/home'
import { renderDetail } from './pages/detail'
import { renderLogin } from './pages/login'
import { initSnowplow, trackSnowplowPageView } from './analytics/snowplow'
import { createFooter } from './components/footer'

initSnowplow()

document.body.appendChild(createFooter())

const APP: HTMLElement | null = document.getElementById('app')
function getApp(): HTMLElement {
  if (!APP) throw new Error('#app not found')
  return APP
}

interface LocationState {
  path: string
  id?: string
}

function parseHash(): [string, string | undefined] {
  const hash = window.location.hash.slice(1) || '/'
  const [path, id] = hash.split('/').filter(Boolean)
  return [path || 'home', id]
}

function render(location?: LocationState | null): void {
  const [path, id] =
    location?.path != null ? [location.path, location.id] : parseHash()
  const app = getApp()
  if ((path === 'video' || path === '/video') && id) {
    renderDetail(app, id, { navigate })
  } else if (path === 'login') {
    renderLogin(app, { navigate })
  } else {
    renderHome(app, { navigate })
  }
}

initRouter(() => {
  const [path, id] = parseHash()
  render({ path: path || 'home', id })
  trackSnowplowPageView()
})

render()
trackSnowplowPageView()

window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header')
  if (header) header.classList.toggle('scrolled', window.scrollY > 50)
})
