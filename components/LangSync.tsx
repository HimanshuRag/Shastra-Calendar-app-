'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/components/LanguageContext'

/**
 * Keeps <html lang="..."> in sync with the user's selected language.
 * Must be rendered inside LanguageProvider (e.g. in the root layout body).
 * Screen readers use the lang attribute for correct pronunciation — without
 * this, Devanagari text is read with English phoneme rules.
 */
export default function LangSync() {
    const { language } = useLanguage()

    useEffect(() => {
        document.documentElement.lang = language === 'hi' ? 'hi' : 'en'
    }, [language])

    return null
}
