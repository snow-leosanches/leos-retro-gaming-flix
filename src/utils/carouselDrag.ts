const DRAG_THRESHOLD = 5

/**
 * Enables click-and-drag (and touch drag) scrolling on a horizontal carousel element.
 * Prevents card click when the user has dragged past the threshold.
 */
export function enableCarouselDrag(track: HTMLElement | null): void {
  if (!track || !track.classList.contains('carousel-track')) return
  const el = track

  let startX = 0
  let startScrollLeft = 0
  let isDragging = false
  let justDragged = false

  function getClientX(e: MouseEvent | TouchEvent): number {
    const t = 'touches' in e ? e.touches[0] : null
    return t ? t.clientX : (e as MouseEvent).clientX
  }

  function onPointerDown(e: MouseEvent | TouchEvent): void {
    if ('button' in e && e.button !== 0 && !('touches' in e)) return
    startX = getClientX(e)
    startScrollLeft = el.scrollLeft
    isDragging = false
    el.style.scrollSnapType = 'none'
    el.style.cursor = 'grabbing'
    document.addEventListener('mousemove', onPointerMove)
    document.addEventListener('mouseup', onPointerUp)
    document.addEventListener('touchmove', onPointerMove, { passive: true })
    document.addEventListener('touchend', onPointerUp)
  }

  function onPointerMove(e: MouseEvent | TouchEvent): void {
    const x = getClientX(e)
    const moved = startX - x
    if (!isDragging && Math.abs(moved) > DRAG_THRESHOLD) {
      isDragging = true
    }
    if (isDragging) {
      el.scrollLeft = startScrollLeft + moved
    }
  }

  function onPointerUp(): void {
    justDragged = isDragging
    el.style.scrollSnapType = 'x mandatory'
    el.style.cursor = 'grab'
    document.removeEventListener('mousemove', onPointerMove)
    document.removeEventListener('mouseup', onPointerUp)
    document.removeEventListener('touchmove', onPointerMove)
    document.removeEventListener('touchend', onPointerUp)
    if (justDragged) {
      setTimeout(() => {
        justDragged = false
      }, 0)
    }
  }

  el.addEventListener('mousedown', onPointerDown as EventListener)
  el.addEventListener('touchstart', onPointerDown as EventListener, { passive: true })
  el.style.cursor = 'grab'

  el.addEventListener(
    'click',
    (e: Event) => {
      if (justDragged) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    true
  )
}
