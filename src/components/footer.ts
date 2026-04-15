import { trackCustomerIdentification, isSnowplowEnabled } from '../analytics/snowplow'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function createFooter(): HTMLElement {
  const footer = document.createElement('footer')
  footer.className = 'site-footer'
  footer.innerHTML = `
    <div class="footer-newsletter">
      <p class="footer-newsletter-label">Stay in the loop</p>
      <div class="footer-newsletter-form">
        <input
          class="footer-newsletter-input"
          type="email"
          placeholder="your@email.com"
          aria-label="Email address"
        />
        <button class="footer-newsletter-btn" type="button">Subscribe</button>
      </div>
      <p class="footer-newsletter-feedback" aria-live="polite"></p>
    </div>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} Leo's Retro Gaming Flix</p>
  `

  const input = footer.querySelector<HTMLInputElement>('.footer-newsletter-input')!
  const btn = footer.querySelector<HTMLButtonElement>('.footer-newsletter-btn')!
  const feedback = footer.querySelector<HTMLParagraphElement>('.footer-newsletter-feedback')!

  function showFeedback(msg: string, error = false): void {
    feedback.textContent = msg
    feedback.className = 'footer-newsletter-feedback' + (error ? ' footer-newsletter-feedback--error' : ' footer-newsletter-feedback--success')
  }

  function subscribe(): void {
    const email = input.value.trim()
    if (!email) {
      showFeedback('Enter an email address.', true)
      input.focus()
      return
    }
    if (!isValidEmail(email)) {
      showFeedback('Enter a valid email address.', true)
      input.focus()
      return
    }
    trackCustomerIdentification(email)
    showFeedback(isSnowplowEnabled() ? 'Subscribed!' : 'Subscribed! (tracking disabled)')
    input.value = ''
    btn.disabled = true
    setTimeout(() => {
      btn.disabled = false
      feedback.textContent = ''
      feedback.className = 'footer-newsletter-feedback'
    }, 3000)
  }

  btn.addEventListener('click', subscribe)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') subscribe()
  })

  return footer
}
