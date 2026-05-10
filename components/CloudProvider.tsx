'use client'

import { ReactNode, useEffect } from 'react'
import { initAnalytics, trackEvent } from '@/lib/analytics'
import { getOrCreateUUID, syncProfileToCloud } from '@/lib/supabase'

/**
 * CloudProvider — bootstraps analytics and background sync on first client render.
 *
 * Responsibilities:
 * 1. Generate / restore the anonymous device UUID
 * 2. Initialise PostHog (no-op if key is missing or a placeholder)
 * 3. Fire an initial profile sync to Supabase with whatever the user already has stored
 * 4. Fire the 'app_opened' event
 */
export default function CloudProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        if (typeof window === 'undefined') return

        // 1 + 2: UUID + PostHog (idempotent — safe to call more than once)
        initAnalytics()

        // 3. Best-effort initial profile sync
        const uuid = getOrCreateUUID()
        if (uuid) {
            const name          = localStorage.getItem('shastra-name')          || undefined
            const zodiac_sign   = localStorage.getItem('shastra-zodiac')        || undefined
            const deity         = localStorage.getItem('shastra-deity')         || undefined
            const city          = localStorage.getItem('shastra-city')          || undefined
            const language      = localStorage.getItem('shastra-language')      || undefined
            const darkRaw       = localStorage.getItem('shastra-dark')
            const notifEnabledRaw = localStorage.getItem('shastra-notif-enabled')
            const notif_time    = localStorage.getItem('shastra-notif-time')    || undefined

            syncProfileToCloud({
                id: uuid,
                name,
                zodiac_sign,
                deity,
                city,
                language,
                dark_mode:     darkRaw !== null ? darkRaw === 'true' : undefined,
                notif_enabled: notifEnabledRaw !== null ? notifEnabledRaw === 'true' : undefined,
                notif_time,
            })
        }

        // 4. Session-open event (deferred so PostHog has a tick to finish init)
        setTimeout(() => {
            trackEvent('app_opened')
        }, 500)
    }, [])

    return <>{children}</>
}
