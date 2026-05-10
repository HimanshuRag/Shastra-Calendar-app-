'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import oracleData from '@/data/oracle-data.json'
import { useLanguage } from '@/components/LanguageContext'
import { useDarkMode } from '@/hooks/useDarkMode'
import { trackEvent } from '@/lib/analytics'

interface OracleEntry {
    id: number
    quote: string
    quote_hi: string
    reference: string
    task: string
    task_hi: string
    theme: string
    image: string
    color: string
}

interface Props {
    showFavourites?: boolean
}

export default function DailyOracle({ showFavourites = false }: Props) {
    const { t, language } = useLanguage()
    const isHindi = language === 'hi'
    const isDark = useDarkMode()
    const flipTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const shareTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const nudgeHideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const nudgeShowTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const mountedRef = useRef(true)
    const nudgeShownRef = useRef(false)
    useEffect(() => {
        mountedRef.current = true
        return () => { mountedRef.current = false }
    }, [])
    const [flipped, setFlipped] = useState(false)
    const [entry, setEntry] = useState<OracleEntry | null>(null)
    const [revealed, setRevealed] = useState(false)
    const [favourites, setFavourites] = useState<number[]>([])
    const [shareMsg, setShareMsg] = useState('')
    const [showShareNudge, setShowShareNudge] = useState(false)

    useEffect(() => {
        // Use day-of-year so each entry appears once before repeating
        const today = new Date()
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / 86_400_000)
        if (!oracleData || oracleData.length === 0) return
        const idx = dayOfYear % oracleData.length
        setEntry(oracleData[idx])

        const syncFavourites = () => {
            const saved = localStorage.getItem('shastra-favourites')
            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    if (Array.isArray(parsed) && parsed.every((x: unknown) => typeof x === 'number' && Number.isFinite(x))) {
                        setFavourites(parsed)
                    } else {
                        setFavourites([])
                    }
                } catch {
                    setFavourites([])
                }
            } else {
                setFavourites([])
            }
        }
        syncFavourites()

        window.addEventListener('shastra-favourites-updated', syncFavourites)

        // Cleanup timers on unmount to avoid setState on unmounted component
        return () => {
            clearTimeout(flipTimerRef.current)
            clearTimeout(shareTimerRef.current)
            clearTimeout(nudgeHideTimerRef.current)
            clearTimeout(nudgeShowTimerRef.current)
            window.removeEventListener('shastra-favourites-updated', syncFavourites)
        }
    }, [])

    const handleFlip = () => {
        clearTimeout(flipTimerRef.current)
        if (!flipped) {
            setFlipped(true)
            trackEvent('oracle_revealed', { entry_id: entry?.id ?? 0 })
            // Match CSS transition duration (0.75s) — reveal content after card is fully turned
            flipTimerRef.current = setTimeout(() => {
                setRevealed(true)
                if (!nudgeShownRef.current) {
                    nudgeShownRef.current = true
                    nudgeShowTimerRef.current = setTimeout(() => {
                        if (!mountedRef.current) return
                        setShowShareNudge(true)
                        nudgeHideTimerRef.current = setTimeout(() => {
                            if (mountedRef.current) setShowShareNudge(false)
                        }, 5000)
                    }, 1200) // show nudge 1.2s after reveal, giving user time to read
                }
            }, 400)
        } else {
            setRevealed(false)
            // Wait for content to fade before flipping back (matches 0.75s transition)
            flipTimerRef.current = setTimeout(() => { setFlipped(false) }, 400)
        }
    }

    const toggleFavourite = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!entry) return
        const isCurrentlyFav = favourites.includes(entry.id)
        trackEvent(isCurrentlyFav ? 'oracle_mantra_removed' : 'oracle_mantra_saved', { entry_id: entry.id })
        const next = isCurrentlyFav
            ? favourites.filter(id => id !== entry.id)
            : [...favourites, entry.id]
        setFavourites(next)
        localStorage.setItem('shastra-favourites', JSON.stringify(next))
        window.dispatchEvent(new Event('shastra-favourites-updated'))
    }

    const handleShare = async (e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (!entry) return
        const text = `"${entry.quote}"\n— ${entry.reference}\n\nToday's Karma: ${entry.task}\n\nFrom Shastra Life 🪔`
        const showCopied = () => {
            setShareMsg('Copied!')
            clearTimeout(shareTimerRef.current)
            shareTimerRef.current = setTimeout(() => { if (mountedRef.current) setShareMsg('') }, 2000)
        }
        try {
            if (navigator.share) {
                await navigator.share({ title: 'Daily Oracle — Shastra Life', text })
                // Share sheet opened successfully — no extra feedback needed
            } else {
                // Desktop or unsupported browser — copy to clipboard
                await navigator.clipboard.writeText(text)
                showCopied()
            }
        } catch (err) {
            // AbortError = user cancelled the share sheet — silent is fine
            // Anything else (e.g. Capacitor WebView doesn't support share) → clipboard fallback
            if (err instanceof Error && err.name !== 'AbortError') {
                try {
                    await navigator.clipboard.writeText(text)
                    showCopied()
                } catch {
                    setShareMsg('Share failed')
                    clearTimeout(shareTimerRef.current)
                    shareTimerRef.current = setTimeout(() => { if (mountedRef.current) setShareMsg('') }, 2000)
                }
            }
        }
    }

    const isFav = entry ? favourites.includes(entry.id) : false
    const savedEntries = (oracleData as OracleEntry[]).filter(e => favourites.includes(e.id))

    // ── My Mantras shelf ──
    if (showFavourites) {
        return (
            <div className="px-1 pb-4 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-2 mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#E8591A" stroke="#E8591A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <h2 className="text-xl font-light text-slate-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{t('mantras.title')}</h2>
                    <span className="text-xs ml-auto" style={{ color: '#9CA3AF', fontFamily: "'Inter', sans-serif" }}>
                        {savedEntries.length === 0 ? 'None saved yet' : `${savedEntries.length} saved`}
                    </span>
                </div>
                {savedEntries.length === 0 && (
                    <div
                        className="flex flex-col items-center justify-center py-8 px-6 rounded-2xl"
                        style={{
                            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(232,89,26,0.03)',
                            border: `1px dashed ${isDark ? 'rgba(232,89,26,0.2)' : 'rgba(232,89,26,0.15)'}`,
                        }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8591A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><circle cx="12" cy="12" r="10"/><path d="M12 6c-1.5 2-3 3.5-3 5.5a3 3 0 0 0 6 0c0-2-1.5-3.5-3-5.5z"/><line x1="12" y1="16" x2="12" y2="18"/></svg>
                        <p className="mt-3 text-sm text-center" style={{
                            color: isDark ? '#78716C' : '#9CA3AF',
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontStyle: 'italic', fontSize: '15px',
                        }}>
                            No mantras saved yet
                        </p>
                        <p className="mt-1 text-xs text-center" style={{
                            color: isDark ? '#57534E' : '#BDB5AD',
                            fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
                        }}>
                            Reveal your oracle and tap ♥ to save a mantra here
                        </p>
                    </div>
                )}
                {savedEntries.length > 0 && (
                    <div className="space-y-3">
                        {savedEntries.map(e => (
                            <div key={e.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(232,89,26,0.1)' }}>
                                <p className="text-base italic text-slate-700 leading-relaxed mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    "{e.quote}"
                                </p>
                                <p className="text-xs text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>— {e.reference}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // ── Oracle card ──
    // Inject pulse-glow keyframe once
    return (
        <>
        <style>{`
            @keyframes oracle-pulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(232,89,26,0.0); }
                50% { box-shadow: 0 0 20px 8px rgba(232,89,26,0.35), 0 0 40px 16px rgba(232,89,26,0.15); }
            }
            .oracle-reveal-btn {
                animation: oracle-pulse 2.5s ease-in-out infinite;
            }
        `}</style>
        <div className="animate-fade-up" style={{ animationFillMode: 'forwards', animationDelay: '200ms' }}>
            <div className="mb-4 flex items-end justify-between">
                <div>
                    <p className="text-xs tracking-widest uppercase text-slate-400 mb-1" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.12em' }}>
                        {t('oracle.label')}
                    </p>
                    <h2 className="text-2xl font-light text-slate-800" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}>
                        {t('oracle.title')}
                    </h2>
                </div>
                {revealed && entry && (
                    <div className="flex items-center gap-2 pb-1">
                        {/* Share */}
                        <button
                            onClick={handleShare}
                            className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
                            style={{ background: 'rgba(232,89,26,0.08)', border: '1px solid rgba(232,89,26,0.15)' }}
                            aria-label={shareMsg || 'Share this oracle'}
                        >
                            {shareMsg ? <span className="text-xs font-bold" style={{ color: '#E8591A' }}>{shareMsg === 'Copied!' ? '✓' : '✕'}</span> : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E8591A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>}
                        </button>
                        {/* Favourite */}
                        <button
                            onClick={toggleFavourite}
                            className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
                            style={{ background: isFav ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isFav ? 'rgba(239,68,68,0.25)' : 'rgba(0,0,0,0.06)'}` }}
                            aria-label={isFav ? 'Remove from favourites' : 'Save to My Mantras'}
                            aria-pressed={isFav}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill={isFav ? '#EF4444' : 'none'} stroke={isFav ? '#EF4444' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: isFav ? 'none' : 'opacity(0.5)' }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        </button>
                    </div>
                )}
            </div>

            <div className="card-scene w-full" style={{ height: '380px' }}>
                <div
                    className={`card-3d ${flipped ? 'flipped' : ''}`}
                    onClick={handleFlip}
                    role="button"
                    aria-label={flipped ? 'Flip card back' : 'Reveal your daily oracle'}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
                >
                    {/* ── FRONT ── */}
                    <div className="card-face card-face-front">
                        <div className="w-full h-full flex flex-col items-center justify-center relative"
                            style={{ background: 'linear-gradient(145deg, #C94A10 0%, #E8591A 35%, #F47B40 55%, #D4AF37 85%, #E8A020 100%)' }}>
                            <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
                                <div className="w-72 h-72 animate-spin-slow">
                                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="100" cy="100" r="95" stroke="white" strokeWidth="0.5" strokeDasharray="6 3" />
                                        <circle cx="100" cy="100" r="75" stroke="white" strokeWidth="0.5" />
                                        <circle cx="100" cy="100" r="55" stroke="white" strokeWidth="0.5" />
                                        <polygon points="100,10 113,68 170,50 132,98 170,150 113,132 100,190 87,132 30,150 68,98 30,50 87,68" stroke="white" strokeWidth="0.8" fill="none" />
                                        <polygon points="100,30 110,72 155,55 128,95 155,145 110,128 100,170 90,128 45,145 72,95 45,55 90,72" stroke="white" strokeWidth="0.5" fill="none" opacity="0.6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="relative flex flex-col items-center">
                                <div className="text-8xl animate-pulse-glow mb-4" style={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'serif', textShadow: '0 0 30px rgba(255,220,120,0.7)', lineHeight: 1 }}>ॐ</div>
                                <div className="flex items-center gap-2 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={`dot-${i}`} className="rounded-full" style={{ width: i === 2 ? 6 : 4, height: i === 2 ? 6 : 4, background: 'rgba(255,255,255,0.6)' }} />
                                    ))}
                                </div>
                                <div className={`oracle-reveal-btn rounded-full px-6 py-2.5 flex items-center gap-2 ${revealed ? 'opacity-0 pointer-events-none' : ''}`} style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)' }}>
                                    <span className="text-white text-sm tracking-wider uppercase" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em', fontWeight: 500 }}>{t('oracle.tap_reveal')}</span>
                                    <span className="text-white text-base animate-float" style={{ display: 'inline-block' }}>✦</span>
                                </div>
                            </div>
                            {['top-4 left-4','top-4 right-4','bottom-4 left-4','bottom-4 right-4'].map((pos) => (
                                <div key={pos} className={`absolute ${pos} text-white opacity-30 text-lg`}>✦</div>
                            ))}
                        </div>
                    </div>

                    {/* ── BACK ── */}
                    <div className="card-face card-face-back">
                        <div
                            className="w-full h-full flex flex-col"
                            style={{
                                background: isDark
                                    ? 'linear-gradient(160deg, #2A1C0A 0%, #1F1408 50%, #1A1208 100%)'
                                    : 'linear-gradient(160deg, #FFFBF5 0%, #FFF5E8 50%, #FAEBD7 100%)',
                            }}
                        >
                            {revealed && entry ? (
                                <>
                                    <div className="flex-shrink-0 flex items-center justify-center py-5 relative" style={{ height: '160px' }}>
                                        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(232,89,26,0.1) 0%, transparent 70%)' }} />
                                        <div className="relative w-32 h-32 animate-float">
                                            <Image src={entry.image} alt={entry.theme} fill className="object-contain" priority />
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between px-6 pb-5 pt-2" style={{ borderTop: '1px solid rgba(232,89,26,0.15)' }}>
                                        <div>
                                            <blockquote
                                                className="text-lg leading-relaxed text-center italic mb-2"
                                                style={{
                                                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                                                    color: isDark ? '#F5E6D0' : '#2D3748',
                                                    fontWeight: 400, fontSize: '17px', lineHeight: 1.5,
                                                }}
                                            >
                                                "{isHindi ? entry.quote_hi : entry.quote}"
                                            </blockquote>
                                            <p className="text-center text-xs text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>— {entry.reference}</p>
                                        </div>
                                        <div className="mt-3 rounded-xl py-3 px-4 flex items-center gap-3" style={{ background: 'rgba(232,89,26,0.07)', border: '1px solid rgba(232,89,26,0.15)' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8591A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M12 2c-2 4-6 6-6 10a6 6 0 0 0 12 0c0-4-4-6-6-10z"/><path d="M12 12v6"/></svg>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-slate-400 mb-0.5" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>{t('oracle.karma')}</p>
                                                <p className="text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif", color: '#E8591A' }}>{isHindi ? entry.task_hi : entry.task}</p>
                                            </div>
                                        </div>
                                        <p className="text-center text-xs text-slate-400 mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>{t('oracle.tap_return')}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(232,89,26,0.15)', borderTopColor: '#E8591A' }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {showShareNudge && (
            <div
                className="flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-500"
                style={{
                    background: isDark ? 'rgba(232,89,26,0.12)' : 'rgba(232,89,26,0.08)',
                    border: '1px solid rgba(232,89,26,0.2)',
                    marginBottom: '12px',
                }}
            >
                <p className="text-xs" style={{ color: isDark ? '#FDBA74' : '#C2410C', fontFamily: "'Inter', sans-serif" }}>
                    ✨ Loved today&apos;s message? Share it with someone
                </p>
                <button
                    onClick={() => { handleShare(); setShowShareNudge(false) }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl active:scale-95 transition-all"
                    style={{ background: '#E8591A', color: 'white', fontFamily: "'Inter', sans-serif" }}
                >
                    Share
                </button>
            </div>
        )}
        </>
    )
}
