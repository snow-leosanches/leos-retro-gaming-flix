import { faker } from '@faker-js/faker'
import { setUser } from '../user-state'
import { knownCustomers } from '../known-customers'
import { setSnowplowUserId, resetSnowplowSession } from '../analytics/snowplow'

type NavigateFn = (path: string, id?: string) => void

function header(navigate: NavigateFn): HTMLElement {
  const el = document.createElement('header')
  el.className = 'site-header'
  el.innerHTML = `
    <a href="#/" class="logo" aria-label="Leo's Retro Gaming Flix - Home">Leo's Retro Gaming Flix</a>
    <nav class="nav">
      <a href="#/" class="nav-link">Home</a>
    </nav>
  `
  el.querySelector('.logo')!.addEventListener('click', (e) => {
    e.preventDefault()
    navigate('home')
  })
  return el
}

export function renderLogin(
  container: HTMLElement,
  { navigate }: { navigate: NavigateFn }
): void {
  container.innerHTML = ''
  container.appendChild(header(navigate))

  const main = document.createElement('main')
  main.className = 'login-content'

  // --- Automatic Login ---
  const autoSection = document.createElement('section')
  autoSection.className = 'login-section'
  autoSection.innerHTML = `
    <h1 class="login-section-title">Automatic Login</h1>
    <p class="login-section-desc">Who are you?</p>
    <button type="button" class="btn-login btn-login-primary">Who, who, who, who?</button>
  `
  autoSection.querySelector('.btn-login-primary')!.addEventListener('click', () => {
    const email = faker.internet.email()
    setUser({
      userId: email,
      name: faker.person.fullName(),
      email,
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
    })
    setSnowplowUserId(email)
    navigate('home')
  })

  // --- Reset Snowplow session ---
  const resetSection = document.createElement('section')
  resetSection.className = 'login-section'
  resetSection.innerHTML = `
    <p class="login-section-desc">Reset Snowplow anonymous session (clears domain/session cookies and user id).</p>
    <button type="button" class="btn-login btn-login-secondary">Reset Snowplow session</button>
  `
  const resetFeedback = document.createElement('p')
  resetFeedback.className = 'login-section-desc'
  resetFeedback.style.color = '#4ade80'
  resetFeedback.style.display = 'none'
  resetFeedback.textContent = 'Snowplow session reset.'
  resetSection.appendChild(resetFeedback)

  resetSection.querySelector('.btn-login-secondary')!.addEventListener('click', () => {
    resetSnowplowSession()
    resetFeedback.style.display = ''
    setTimeout(() => { resetFeedback.style.display = 'none' }, 3000)
  })

  // --- Manual Login ---
  const manualSection = document.createElement('section')
  manualSection.className = 'login-section'
  manualSection.innerHTML = `
    <h1 class="login-section-title">Manual Login</h1>
    <label for="login-email" class="login-label">Email</label>
    <input
      id="login-email"
      type="email"
      inputmode="email"
      autocomplete="email"
      placeholder="you@example.com"
      class="login-input"
    />
    <button type="button" class="btn-login btn-login-primary">Manual Login</button>
  `
  const emailInput = manualSection.querySelector<HTMLInputElement>('#login-email')!
  const manualBtn = manualSection.querySelector('.btn-login-primary')!

  const doManualLogin = () => {
    const email = emailInput.value.trim()
    if (!email) return
    setUser({
      userId: email,
      name: '',
      email,
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    })
    setSnowplowUserId(email)
    navigate('home')
  }

  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doManualLogin()
  })
  manualBtn.addEventListener('click', doManualLogin)

  // --- Returning Users Login ---
  const knownSection = document.createElement('section')
  knownSection.className = 'login-section'
  knownSection.innerHTML = `<h1 class="login-section-title">Returning Users</h1>`

  for (const customer of knownCustomers) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'btn-login btn-login-primary'
    btn.textContent = `${customer.name} (${customer.email})`
    btn.addEventListener('click', () => {
      setUser({
        userId: customer.id,
        name: customer.name,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        country: customer.country,
      })
      setSnowplowUserId(customer.id)
      navigate('home')
    })
    knownSection.appendChild(btn)
  }

  const card = document.createElement('div')
  card.className = 'login-card'
  card.appendChild(autoSection)
  card.appendChild(resetSection)
  card.appendChild(manualSection)
  card.appendChild(knownSection)

  main.appendChild(card)
  container.appendChild(main)
}
