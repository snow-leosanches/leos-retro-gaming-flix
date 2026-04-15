/**
 * Snowplow analytics with Media Player plugins (YouTube, Vimeo, HTML5).
 * Aligns with Snowplow Media Player dbt package / v2 media schemas.
 * @see https://docs.snowplow.io/docs/modeling-your-data/modeling-your-data-with-dbt/dbt-models/dbt-media-player-data-model/
 * @see https://docs.snowplow.io/docs/sources/web-trackers/tracking-events/media/html5/
 */

import {
  newTracker,
  trackPageView,
  enableActivityTracking,
  setUserId,
  clearUserData,
} from '@snowplow/browser-tracker'
import { trackCustomerIdentification as _trackCustomerIdentification } from '../../snowtype/snowplow'
import { YouTubeTrackingPlugin, startYouTubeTracking, endYouTubeTracking } from '@snowplow/browser-plugin-youtube-tracking'
import { VimeoTrackingPlugin, startVimeoTracking, endVimeoTracking } from '@snowplow/browser-plugin-vimeo-tracking'
import {
  MediaTrackingPlugin,
  startHtml5MediaTracking,
  endHtml5MediaTracking,
} from '@snowplow/browser-plugin-media-tracking'
import type { VideoProvider } from '../types/content'

const TRACKER_NAME = 'sp1'
const COLLECTOR_URL = import.meta.env.VITE_SNOWPLOW_COLLECTOR_URL as string | undefined

let initialized = false

export function isSnowplowEnabled(): boolean {
  return Boolean(COLLECTOR_URL && COLLECTOR_URL.length > 0)
}

/**
 * Initialize the Snowplow tracker with YouTube, Vimeo, and HTML5 media plugins.
 * Call once at app startup (e.g. in main.ts).
 * No-op if VITE_SNOWPLOW_COLLECTOR_URL is not set.
 */
export function initSnowplow(): void {
  if (!COLLECTOR_URL || initialized) return
  try {
    newTracker(TRACKER_NAME, COLLECTOR_URL, {
      appId: 'leos-retro-gaming-flix',
      plugins: [
        YouTubeTrackingPlugin(),
        VimeoTrackingPlugin(),
        MediaTrackingPlugin(),
      ],
    })
    enableActivityTracking({
      minimumVisitLength: 5,
      heartbeatDelay: 10,
    })
    initialized = true
  } catch (e) {
    console.warn('[Snowplow] Tracker init failed:', e)
  }
}

/**
 * Track a page view. Call on route change or initial load.
 */
export function trackSnowplowPageView(): void {
  if (!initialized) return
  try {
    trackPageView({}, [TRACKER_NAME])
  } catch (e) {
    console.warn('[Snowplow] trackPageView failed:', e)
  }
}

export interface MediaTrackingHandle {
  mediaSessionId: string | null
  endTracking: () => void
}

/**
 * Start media tracking for an embedded YouTube or Vimeo iframe.
 * Call after the iframe is in the DOM. When the player is closed, call endTracking().
 */
export function startMediaTracking(
  iframe: HTMLIFrameElement,
  provider: VideoProvider,
  options?: { label?: string }
): MediaTrackingHandle {
  const id = crypto.randomUUID()
  let ended = false

  function endTracking(): void {
    if (ended || !initialized) return
    ended = true
    try {
      if (provider === 'youtube') {
        endYouTubeTracking(id)
      } else {
        endVimeoTracking(id)
      }
    } catch (e) {
      console.warn('[Snowplow] endMediaTracking failed:', e)
    }
  }

  if (!initialized) {
    return { mediaSessionId: null, endTracking }
  }

  try {
    if (provider === 'youtube') {
      const sessionId = startYouTubeTracking({
        id,
        video: iframe,
        label: options?.label,
      })
      return { mediaSessionId: sessionId ?? id, endTracking }
    } else {
      startVimeoTracking({
        id,
        video: iframe,
        ...(options?.label !== undefined && { player: { label: options.label } }),
      })
      return { mediaSessionId: id, endTracking }
    }
  } catch (e) {
    console.warn('[Snowplow] startMediaTracking failed:', e)
    return { mediaSessionId: null, endTracking }
  }
}

/**
 * Start HTML5 media tracking for a <video> or <audio> element.
 * Use when you have native HTML5 media on the page.
 * @see https://docs.snowplow.io/docs/sources/web-trackers/tracking-events/media/html5/
 */
export function startHtml5Tracking(
  element: string | HTMLMediaElement,
  options?: { label?: string; boundaries?: number[] }
): MediaTrackingHandle {
  const id = crypto.randomUUID()
  let ended = false

  function endTracking(): void {
    if (ended || !initialized) return
    ended = true
    try {
      endHtml5MediaTracking(id)
    } catch (e) {
      console.warn('[Snowplow] endHtml5MediaTracking failed:', e)
    }
  }

  if (!initialized) {
    return { mediaSessionId: null, endTracking }
  }

  try {
    startHtml5MediaTracking({
      id,
      video: element,
      ...(options?.label !== undefined && { label: options.label }),
      ...(options?.boundaries !== undefined && { boundaries: options.boundaries }),
    })
    return { mediaSessionId: id, endTracking }
  } catch (e) {
    console.warn('[Snowplow] startHtml5MediaTracking failed:', e)
    return { mediaSessionId: null, endTracking }
  }
}

export function setSnowplowUserId(userId: string | null): void {
  if (!initialized) return
  try {
    setUserId(userId, [TRACKER_NAME])
  } catch (e) {
    console.warn('[Snowplow] setUserId failed:', e)
  }
}

export function trackCustomerIdentification(email: string): void {
  if (!initialized) return
  try {
    _trackCustomerIdentification({ email }, [TRACKER_NAME])
  } catch (e) {
    console.warn('[Snowplow] trackCustomerIdentification failed:', e)
  }
}

export function resetSnowplowSession(): void {
  if (!initialized) return
  try {
    clearUserData({ preserveSession: false, preserveUser: false }, [TRACKER_NAME])
    setUserId(null, [TRACKER_NAME])
  } catch (e) {
    console.warn('[Snowplow] resetSession failed:', e)
  }
}

/** Re-export for direct use (e.g. custom config). */
export { startHtml5MediaTracking, endHtml5MediaTracking }
