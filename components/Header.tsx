'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/components/LanguageContext'
import { useDarkMode } from '@/hooks/useDarkMode'

function getStreak(): number {
    if (typeof window === 'undefined') return 0
    const today = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    const lastOpen = localStorage.getItem('shastra-last-open')
    const streakCount = parseInt(localStorage.getItem('shastra-streak') || '0', 10)

    if (lastOpen === todayKey) {
        // Already opened today — return current streak
        return streakCount
    }

    // Check if yesterday
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`

    const newStreak = lastOpen === yesterdayKey ? streakCount + 1 : 1
    localStorage.setItem('shastra-streak', String(newStreak))
    localStorage.setItem('shastra-last-open', todayKey)
    return newStreak
}

// SVG pin icon — consistent across all Android versions, no emoji rendering issues
function PinIcon({ color = '#E8591A' }: { color?: string }) {
    return (
        <svg width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M6.5 0C3.462 0 1 2.462 1 5.5c0 4.125 5.5 10.5 5.5 10.5S12 9.625 12 5.5C12 2.462 9.538 0 6.5 0z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.2"/>
            <circle cx="6.5" cy="5.5" r="2" fill={color}/>
        </svg>
    )
}

export default function Header() {
    const { setCoordinates, t, language } = useLanguage()
    const isDark = useDarkMode()
    const [scrolled, setScrolled] = useState(false)
    // City is set in useEffect to avoid SSR hydration mismatch
    const [city, setCity] = useState('')
    const [loading, setLoading] = useState(false)
    const [locationError, setLocationError] = useState(false)
    const [streak, setStreak] = useState(0)
    const [userName, setUserName] = useState('')
    const [showStreakTip, setShowStreakTip] = useState(false)
    const streakRef = useRef<HTMLButtonElement>(null)
    const mountedRef = useRef(true)
    const streakHintOuterRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const streakHintInnerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const locationAbortRef = useRef<AbortController | null>(null)
    const [today, setToday] = useState(() => new Date())

    const VARA_KEYS = ['Ravivara','Somavara','Mangalavara','Budhavara','Guruvara','Shukravara','Shanivara']
    const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const dateStr = language === 'hi'
        ? `${t('vara.' + VARA_KEYS[today.getDay()])}, ${today.getDate()} ${t('month.' + MONTH_NAMES[today.getMonth()])}`
        : today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

    useEffect(() => {
        mountedRef.current = true
        return () => { mountedRef.current = false }
    }, [])

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const now = new Date()
        const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
        const id = setTimeout(() => setToday(new Date()), msUntilMidnight)
        return () => clearTimeout(id)
    }, [today])

    useEffect(() => {
        if (!showStreakTip) return
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowStreakTip(false) }
        const handleClickOutside = (e: MouseEvent) => {
            if (streakRef.current && !streakRef.current.contains(e.target as Node)) {
                setShowStreakTip(false)
            }
        }
        document.addEventListener('keydown', handleKey)
        document.addEventListener('pointerdown', handleClickOutside)
        return () => {
            document.removeEventListener('keydown', handleKey)
            document.removeEventListener('pointerdown', handleClickOutside)
        }
    }, [showStreakTip])

    const fetchLocation = useCallback((silent = false) => {
        if (!navigator.geolocation) {
            setLocationError(true)
            return
        }
        // If we already have a cached city, refresh silently in background — no spinner
        if (!silent) {
            setLoading(true)
        }
        setLocationError(false)

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords
                    setCoordinates(latitude, longitude)
                    const controller = new AbortController()
                    locationAbortRef.current = controller
                    const fetchTimeout = setTimeout(() => controller.abort(), 6000)
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&email=support@shastralife.app`,
                        { headers: { 'Accept-Language': 'en' }, signal: controller.signal }
                    )
                    clearTimeout(fetchTimeout)
                    const data = await res.json()
                    const resolved =
                        data.address?.city ||
                        data.address?.town ||
                        data.address?.village ||
                        data.address?.suburb ||
                        data.address?.county ||
                        ''
                    setCity(resolved)
                    // Cache so it shows instantly next open
                    if (resolved) localStorage.setItem('shastra-city', resolved)
                    setLocationError(false)
                } catch {
                    // Reverse-geocode failed — coordinates still set, just no city name
                    setLocationError(true)
                } finally {
                    setLoading(false)
                }
            },
            (err) => {
                // PERMISSION_DENIED = 1, POSITION_UNAVAILABLE = 2, TIMEOUT = 3
                setLoading(false)
                setLocationError(true)
                if (err.code !== 1) {
                    // Not a denial — worth retrying, clear cache so stale city isn't shown forever
                    // Keep cached city visible but mark as stale with the error flag
                }
            },
            {
                enableHighAccuracy: false,   // faster on mobile, battery-friendly
                timeout: 10000,              // 10s max — don't hang forever
                maximumAge: 5 * 60 * 1000,  // accept a 5-min-old GPS fix (much faster re-open)
            }
        )
    }, [setCoordinates])

    useEffect(() => {
        // Streak - must be in useEffect (localStorage is client-only)
        if (typeof window !== 'undefined') {
            const newStreak = getStreak()
            setStreak(newStreak)
            setUserName(localStorage.getItem('shastra-name') || '')
            // Auto-show streak hint tooltip on first-ever open
            const hasSeenHint = localStorage.getItem('shastra-streak-hint-seen')
            if (!hasSeenHint && newStreak === 1) {
                localStorage.setItem('shastra-streak-hint-seen', 'true')
                streakHintOuterRef.current = setTimeout(() => {
                    if (!mountedRef.current) return
                    setShowStreakTip(true)
                    streakHintInnerRef.current = setTimeout(() => {
                        if (!mountedRef.current) return
                        setShowStreakTip(false)
                    }, 3500)
                }, 1500)
            }
        }

        // If we already have a cached city, do a silent background refresh
        const cachedCity = localStorage.getItem('shastra-city')
        fetchLocation(!!cachedCity)

        return () => {
            clearTimeout(streakHintOuterRef.current)
            clearTimeout(streakHintInnerRef.current)
            locationAbortRef.current?.abort()
        }
    }, [fetchLocation])

    return (
        <header
            className="w-full px-6 pt-8 pb-2 sticky top-0 z-40 transition-all duration-300"
            style={{
                background: isDark
                    ? scrolled ? 'rgba(18,12,4,0.97)' : 'rgba(18,12,4,0.0)'
                    : scrolled ? 'rgba(250,247,242,0.97)' : 'rgba(250,247,242,0.0)',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
            }}
        >
            <div className="max-w-lg mx-auto">
                {/* Brand row */}
                <div
                    className="flex items-center justify-between transition-all duration-300"
                    style={{
                        maxHeight: scrolled ? '0px' : '80px',
                        opacity: scrolled ? 0 : 1,
                        marginBottom: scrolled ? '0px' : '20px',
                        pointerEvents: scrolled ? 'none' : 'auto',
                        overflow: scrolled ? 'hidden' : 'visible',
                    }}
                >
                    <div>
                        <h1
                            className="text-3xl font-light tracking-wide text-slate-800"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.04em' }}
                        >
                            Shastra Life
                        </h1>
                        <p className="text-xs text-slate-400 tracking-widest uppercase mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {t('app.subtitle')}
                        </p>
                        {userName && (
                            <p className="text-xs mt-0.5" style={{ fontFamily: "'Inter', sans-serif", color: '#E8591A' }}>
                                Namaste, {userName}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Streak badge */}
                        {streak > 0 && (
                            <div className="relative">
                                <button
                                    ref={streakRef}
                                    onClick={() => setShowStreakTip(v => !v)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-full cursor-pointer transition-all active:scale-95"
                                    style={{ background: 'rgba(232,89,26,0.1)', border: '1px solid rgba(232,89,26,0.2)' }}
                                    aria-label={`${streak}-day streak`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#E8591A" stroke="#E8591A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-2 5-6 7-6 12a6 6 0 0 0 12 0c0-5-4-7-6-12z"/></svg>
                                    <span className="text-xs font-bold" style={{ color: '#E8591A', fontFamily: "'Inter', sans-serif" }}>
                                        {streak}
                                    </span>
                                </button>
                                {showStreakTip && (
                                    <div
                                        className="absolute right-0 top-9 z-50 rounded-xl px-3 py-2.5 shadow-lg"
                                        style={{
                                            background: isDark ? 'rgba(30,20,8,0.97)' : 'rgba(255,255,255,0.97)',
                                            border: isDark ? '1px solid rgba(232,89,26,0.25)' : '1px solid rgba(232,89,26,0.15)',
                                            width: '190px',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                        }}
                                        onClick={() => setShowStreakTip(false)}
                                    >
                                        <p className="text-xs font-semibold mb-0.5" style={{ fontFamily: "'Inter', sans-serif", color: isDark ? '#E2D9C8' : '#374151' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#E8591A" stroke="#E8591A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}><path d="M12 2c-2 5-6 7-6 12a6 6 0 0 0 12 0c0-5-4-7-6-12z"/></svg>
                                            {streak} {t('header.streak_days')}
                                        </p>
                                        <p className="text-xs leading-snug" style={{ fontFamily: "'Inter', sans-serif", color: isDark ? '#9CA3AF' : '#9CA3AF' }}>
                                            {t('header.streak_sub')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Om badge */}
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(232,89,26,0.1)', border: '1px solid rgba(232,89,26,0.2)' }}
                        >
                            <span className="text-2xl" style={{ color: '#E8591A', lineHeight: 1 }}>ॐ</span>
                        </div>
                    </div>
                </div>

                {/* Date + Location row */}
                <div className="flex items-center justify-between gap-3">
                    <p className="text-slate-600 text-sm shrink-0" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                        {dateStr}
                    </p>
                    <button
                        className="flex items-center gap-1.5 transition-all active:opacity-60 min-w-0"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        onClick={() => fetchLocation(false)}
                        aria-label={locationError ? 'Location unavailable — tap to retry' : 'Tap to update location'}
                        title={locationError ? 'Tap to retry' : 'Tap to update location'}
                    >
                        {/* Pin icon — colour reflects state */}
                        <PinIcon color={locationError ? '#EF4444' : loading ? '#9CA3AF' : '#E8591A'} />

                        <span
                            className="text-sm font-medium truncate transition-colors duration-200"
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                color: locationError
                                    ? '#EF4444'
                                    : isDark ? '#C9A97A' : '#374151',
                                maxWidth: '120px',
                            }}
                        >
                            {loading ? (
                                <span className={`inline-block w-16 h-3 rounded animate-pulse align-middle ${isDark ? 'bg-stone-700' : 'bg-slate-200'}`} />
                            ) : locationError && !city ? (
                                'Tap to retry'
                            ) : (
                                city || t('location.your')
                            )}
                        </span>

                        {/* Refresh chevron — spins while loading */}
                        <svg
                            width="11" height="11" viewBox="0 0 11 11" fill="none"
                            stroke={locationError ? '#EF4444' : '#9CA3AF'}
                            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                            style={{ flexShrink: 0, transition: 'transform 0.4s', transform: loading ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                            <path d="M9 5.5A3.5 3.5 0 1 1 5.5 2M5.5 2L7.5 4M5.5 2L3.5 4" />
                        </svg>
                    </button>
                </div>

                {/* Divider */}
                <div className="mt-5 h-px w-full" style={{
                    background: isDark
                        ? 'linear-gradient(90deg, transparent, rgba(232,89,26,0.35), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(232,89,26,0.2), transparent)'
                }} />
            </div>
        </header>
    )
}
