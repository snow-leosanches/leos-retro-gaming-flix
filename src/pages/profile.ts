import { faker } from '@faker-js/faker'
import { getUser, setUser, clearUser } from '../user-state'
import { setSnowplowUserId, resetSnowplowSession } from '../analytics/snowplow'

type NavigateFn = (path: string, id?: string) => void

function escapeHtml(s: string): string {
  if (!s) return ''
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

export function renderProfile(
  container: HTMLElement,
  { navigate }: { navigate: NavigateFn }
): void {
  container.innerHTML = ''

  const header = document.createElement('header')
  header.className = 'site-header'
  header.innerHTML = `
    <a href="#/" class="logo" aria-label="Leo's Retro Gaming Flix - Home">Leo's Retro Gaming Flix</a>
    <nav class="nav">
      <a href="#/" class="nav-link">Home</a>
    </nav>
  `
  header.querySelector('.logo')!.addEventListener('click', (e) => {
    e.preventDefault()
    navigate('home')
  })
  header.querySelector('a[href="#/"]')!.addEventListener('click', (e) => {
    e.preventDefault()
    navigate('home')
  })

  const main = document.createElement('main')
  main.className = 'profile-content'
  container.appendChild(header)
  container.appendChild(main)

  function render(): void {
    const user = getUser()
    main.innerHTML = ''

    if (!user) {
      main.innerHTML = `
        <div class="profile-card">
          <h1 class="profile-title">You are not logged in</h1>
          <button type="button" class="btn-login btn-login-primary" id="btn-signin">Sign In</button>
        </div>
      `
      main.querySelector('#btn-signin')!.addEventListener('click', () => navigate('login'))
      return
    }

    main.innerHTML = `
      <div class="profile-card">
        <h1 class="profile-title">Your Account</h1>

        <section class="profile-section">
          <div class="profile-field">
            <span class="profile-label">Name</span>
            <span class="profile-value" id="profile-name">${escapeHtml(user.name)}</span>
          </div>
          <div class="profile-field">
            <span class="profile-label">Email</span>
            <span class="profile-value" id="profile-email">${escapeHtml(user.email)}</span>
          </div>
          <div class="profile-actions">
            <button type="button" class="btn-login btn-login-secondary" id="btn-change-name">Change Name</button>
            <button type="button" class="btn-login btn-login-secondary" id="btn-change-email">Change Email</button>
          </div>
        </section>

        <section class="profile-section">
          <h2 class="profile-section-title">Address</h2>
          <div class="profile-field">
            <span class="profile-label">Street</span>
            <span class="profile-value">${escapeHtml(user.address) || '<span class="profile-empty">—</span>'}</span>
          </div>
          <div class="profile-field">
            <span class="profile-label">City</span>
            <span class="profile-value">${escapeHtml(user.city) || '<span class="profile-empty">—</span>'}</span>
          </div>
          <div class="profile-field">
            <span class="profile-label">State</span>
            <span class="profile-value">${escapeHtml(user.state) || '<span class="profile-empty">—</span>'}</span>
          </div>
          <div class="profile-field">
            <span class="profile-label">Zip Code</span>
            <span class="profile-value">${escapeHtml(user.zipCode) || '<span class="profile-empty">—</span>'}</span>
          </div>
          <div class="profile-field">
            <span class="profile-label">Country</span>
            <span class="profile-value">${escapeHtml(user.country) || '<span class="profile-empty">—</span>'}</span>
          </div>
        </section>

        <section class="profile-section">
          <button type="button" class="btn-login btn-login-primary" id="btn-logout">Log Out</button>
        </section>
      </div>
    `

    main.querySelector('#btn-change-name')!.addEventListener('click', () => {
      const current = getUser()
      if (!current) return
      setUser({ ...current, name: faker.person.fullName() })
      render()
    })

    main.querySelector('#btn-change-email')!.addEventListener('click', () => {
      const current = getUser()
      if (!current) return
      const email = faker.internet.email()
      setUser({ ...current, email, userId: email })
      setSnowplowUserId(email)
      render()
    })

    main.querySelector('#btn-logout')!.addEventListener('click', () => {
      clearUser()
      resetSnowplowSession()
      navigate('home')
    })
  }

  render()
}
