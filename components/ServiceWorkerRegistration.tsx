'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

        // Do not register a SW inside the Capacitor native WebView — it can interfere
        // with the Capacitor bridge and serves no purpose (assets are already local)
        if (typeof window !== 'undefined' && window.location.protocol === 'capacitor:') return
        // Also skip for the custom https scheme Capacitor uses on Android
        if (typeof window !== 'undefined' && window.navigator.userAgent.includes('CapacitorWebView')) return

        let isMounted = true
        let swRegistration: ServiceWorkerRegistration | null = null
        let updateFoundHandler: (() => void) | null = null

        navigator.serviceWorker.register('/sw.js').then(registration => {
            if (!isMounted) return
            swRegistration = registration

            // Silently apply waiting worker updates (no banner)
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            }

            updateFoundHandler = () => {
                if (!isMounted) return
                const newWorker = registration.installing
                if (!newWorker) return
                newWorker.addEventListener('statechange', () => {
                    if (!isMounted) return
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Silently apply the update
                        newWorker.postMessage({ type: 'SKIP_WAITING' })
                    }
                })
            }
            registration.addEventListener('updatefound', updateFoundHandler)
        }).catch(err => {
            console.error('SW registration failed', err)
        })

        return () => {
            isMounted = false
            if (swRegistration && updateFoundHandler) {
                swRegistration.removeEventListener('updatefound', updateFoundHandler)
            }
        }
    }, [])

    // Updates are applied silently — no banner needed
    return null
}
