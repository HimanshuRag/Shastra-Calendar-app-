/**
 * Shastra Life — Analytics Service (PostHog)
 *
 * Call initAnalytics() once at app start (AnalyticsProvider does this).
 * Then use trackEvent() and setUserProperty() freely anywhere in the app.
 *
 * All events follow noun_verb naming: oracle_revealed, tab_viewed, etc.
 */

import posthog from 'posthog-js'
import { getOrCreateUUID, syncProfileToCloud, UserProfileSyncData } from './supabase'

let initialised = false

// ─── Init ─────────────────────────────────────────────────────────────────────

/**
 * Bootstrap PostHog and tie the session to the device's anonymous UUID.
 * Safe to call multiple times — no-ops after the first call.
 */
export function initAnalytics(): void {
    if (typeof window === 'undefined' || initialised) return

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

    // Don't initialise if key is missing or is still a placeholder
    if (!key || key === 'phc_your_api_key_here') {
        if (process.env.NODE_ENV === 'development') {
            console.log('[Analytics] PostHog key not configured — events will only log to console.')
        }
        initialised = true
        return
    }

    try {
        posthog.init(key, {
            api_host: host,
            // Capture pageviews manually so we control when/what is sent
            capture_pageview: false,
            // Don't capture clicks/forms automatically — we fire explicit events
            autocapture: false,
            // Disable session recording (GDPR-friendly default)
            disable_session_recording: true,
            // Respect browser Do-Not-Track header
            respect_dnt: true,
            // Persist identity across page loads
            persistence: 'localStorage',
            // Bootstrap with our own UUID so PostHog doesn't assign a new distinct_id
            bootstrap: {
                distinctID: getOrCreateUUID(),
            },
        })

        // Identify the user with our stable device UUID
        const uuid = getOrCreateUUID()
        if (uuid) {
            posthog.identify(uuid)

            // Attach any already-known user properties (e.g. from a returning user)
            const lang = localStorage.getItem('shastra-language')
            const zodiac = localStorage.getItem('shastra-zodiac')
            const deity = localStorage.getItem('shastra-deity')
            const dark = localStorage.getItem('shastra-dark')

            const props: Record<string, string | boolean> = {}
            if (lang) props['language'] = lang
            if (zodiac) props['zodiac_sign'] = zodiac
            if (deity) props['ishta_devata'] = deity
            if (dark !== null) props['dark_mode'] = dark === 'true'

            if (Object.keys(props).length > 0) {
                try { posthog.people.set(props) } catch { /* ignore */ }
            }
        }

        initialised = true

        if (process.env.NODE_ENV === 'development') {
            console.log('[Analytics] PostHog initialised — distinct_id:', getOrCreateUUID())
        }
    } catch {
        // PostHog blocked by ad-blocker or threw — silently continue
        initialised = true
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitiseValue(v: unknown): unknown {
    if (typeof v === 'string') {
        return v.replace(/[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\uFEFF]/g, '').slice(0, 200)
    }
    return v
}

// ─── Event types ──────────────────────────────────────────────────────────────

export type AnalyticsEvent =
    | 'app_opened'
    | 'tab_viewed'
    | 'language_changed'
    | 'dark_mode_toggled'
    | 'oracle_revealed'
    | 'oracle_mantra_saved'
    | 'oracle_mantra_removed'
    | 'zodiac_selected'
    | 'deity_selected'
    | 'horoscope_sign_changed'
    | 'calendar_date_selected'
    | 'notification_toggled'
    | 'onboarding_completed'
    | 'location_updated'
    | 'reset_triggered'

type EventParams = Record<string, string | number | boolean>

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Log an analytics event with optional parameters.
 */
export function trackEvent(event: AnalyticsEvent, params?: EventParams): void {
    if (typeof window === 'undefined') return

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] ${event}`, params)
    }

    if (!initialised) return

    try {
        const safeParams = params
            ? Object.fromEntries(Object.entries(params).map(([k, v]) => [k, sanitiseValue(v)]))
            : undefined
        posthog.capture(event, safeParams)
    } catch {
        // PostHog blocked or threw — silently continue
    }
}

const ALLOWED_PROPS = new Set(['zodiac_sign', 'ishta_devata', 'language', 'dark_mode'])

/**
 * Set a persistent user property that is attached to all future events.
 * Also syncs the value to Supabase in the background.
 */
export function setUserProperty(key: string, value: string | boolean): void {
    const safeValue = typeof value === 'boolean' ? value : String(value).slice(0, 36)

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] setUserProperty: ${key} = ${safeValue}`)
    }

    // 1. Tell PostHog
    if (initialised && ALLOWED_PROPS.has(key)) {
        try { posthog.people.set({ [key]: safeValue }) } catch { /* ignore */ }
    }

    // 2. Fire-and-forget to Supabase
    if (typeof window !== 'undefined') {
        const uuid = getOrCreateUUID()
        if (uuid) {
            const payload: Partial<UserProfileSyncData> = { id: uuid }
            if (key === 'zodiac_sign')    payload.zodiac_sign   = safeValue as string
            if (key === 'language')       payload.language      = safeValue as string
            if (key === 'dark_mode')      payload.dark_mode     = safeValue as boolean
            if (key === 'ishta_devata')   payload.deity         = safeValue as string
            if (key === 'city')           payload.city          = safeValue as string
            if (key === 'notif_enabled')  payload.notif_enabled = safeValue as boolean
            if (key === 'notif_time')     payload.notif_time    = safeValue as string
            if (key === 'name')           payload.name          = safeValue as string

            syncProfileToCloud(payload as UserProfileSyncData)
        }
    }
}
