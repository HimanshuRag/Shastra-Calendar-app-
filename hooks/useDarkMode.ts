'use client'

import { useState, useEffect } from 'react'

/**
 * Reactively tracks whether the `.dark` class is present on <html>.
 * The dashboard adds/removes it via handleDarkModeToggle — this hook
 * lets any component re-render whenever dark mode changes without
 * prop-drilling.
 */
export function useDarkMode(): boolean {
    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof document === 'undefined') return false
        return document.documentElement.classList.contains('dark')
    })

    useEffect(() => {
        const el = document.documentElement
        // Initialise from current state
        setIsDark(el.classList.contains('dark'))

        // Watch for future changes (toggle in Settings)
        const observer = new MutationObserver(() => {
            setIsDark(el.classList.contains('dark'))
        })
        observer.observe(el, { attributes: true, attributeFilter: ['class'] })
        return () => observer.disconnect()
    }, [])

    return isDark
}
