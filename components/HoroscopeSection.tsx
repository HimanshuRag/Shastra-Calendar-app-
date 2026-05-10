'use client'

import { useState, useEffect } from 'react'
import { fetchMockHoroscope, HoroscopeData, ZODIACS } from '@/lib/mock-horoscope'
import { useLanguage } from '@/components/LanguageContext'
import { useDarkMode } from '@/hooks/useDarkMode'
import { trackEvent } from '@/lib/analytics'

export default function HoroscopeSection() {
    const isDark = useDarkMode()
    const { t, language } = useLanguage()
    const isHindi = language === 'hi'

    // C-04 fix: initialise to 'Aries' (SSR-safe), then read localStorage in useEffect
    const [selectedSign, setSelectedSign] = useState<string>('Aries')
    const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null)
    const [loading, setLoading] = useState(true)
    const [cardKey, setCardKey] = useState(0)

    useEffect(() => {
        try {
            const saved = localStorage.getItem('shastra-zodiac')
            if (saved) setSelectedSign(saved)
        } catch { /* storage unavailable in private mode */ }
    }, [])

    useEffect(() => {
        let isMounted = true
        setLoading(true)

        fetchMockHoroscope(selectedSign)
            .then(data => {
                if (isMounted) {
                    setHoroscope(data)
                    setLoading(false)
                    setCardKey(k => k + 1)
                }
            })
            .catch(() => {
                // M-14: handle rejection so spinner doesn't stick forever
                if (isMounted) setLoading(false)
            })

        return () => { isMounted = false }
    }, [selectedSign])

    const cardBg = isDark
        ? 'linear-gradient(160deg, rgba(42,28,10,0.9), rgba(31,20,8,0.95))'
        : 'linear-gradient(160deg, rgba(255,255,255,0.9), rgba(255,248,240,0.95))'

    return (
        <div className="animate-fade-up delay-300" style={{ animationFillMode: 'forwards', opacity: 0 }}>
            {/* Section Title */}
            <div className="flex items-center gap-2.5 mb-5 mt-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8591A, #D4AF37)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-800" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
                        {t('horoscope.title')}
                    </h2>
                </div>
            </div>

            {/* Zodiac Selector */}
            <div
                className="flex gap-3 overflow-x-auto pb-5 px-1 hide-scrollbar"
                style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
            >
                {ZODIACS.map((zodiac, i) => {
                    const isSelected = selectedSign === zodiac.name
                    return (
                        <button
                            key={zodiac.name}
                            onClick={() => {
                                setSelectedSign(zodiac.name)
                                try { localStorage.setItem('shastra-zodiac', zodiac.name) } catch { /* storage unavailable */ }
                                trackEvent('horoscope_sign_changed', { sign: zodiac.name })
                            }}
                            className="flex flex-col items-center justify-center flex-shrink-0"
                            style={{ scrollSnapAlign: 'center', animationDelay: `${i * 50}ms` }}
                            aria-label={t(`zodiac.${zodiac.name}`)}
                            aria-pressed={isSelected}
                        >
                            <div className="relative mb-2">
                                <div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'animate-bounce-in' : ''}`}
                                    style={{
                                        background: isSelected
                                            ? 'linear-gradient(135deg, rgba(232,89,26,0.12), rgba(212,175,55,0.12))'
                                            : isDark ? 'rgba(42,28,10,0.8)' : 'rgba(255,255,255,0.8)',
                                        border: isSelected ? '2.5px solid #E8591A' : `2px solid ${isDark ? 'rgba(232,89,26,0.2)' : 'rgba(0,0,0,0.06)'}`,
                                        boxShadow: isSelected
                                            ? '0 4px 20px rgba(232,89,26,0.2), 0 0 0 3px rgba(232,89,26,0.08)'
                                            : '0 2px 8px rgba(0,0,0,0.04)',
                                        transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                                    }}
                                >
                                    <span
                                        className="leading-none transition-all duration-300"
                                        style={{ fontSize: isSelected ? '28px' : '22px', filter: isSelected ? 'none' : 'grayscale(0.3)' }}
                                    >
                                        {zodiac.symbol}
                                    </span>
                                </div>
                                {isSelected && (
                                    <div
                                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full animate-bounce-in"
                                        style={{ background: '#E8591A' }}
                                    />
                                )}
                            </div>
                            <span
                                className="font-medium transition-colors duration-200"
                                style={{
                                    color: isSelected ? '#E8591A' : '#9CA3AF',
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '11px',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {t(`zodiac.${zodiac.name}`)}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Horoscope Card */}
            <div
                key={cardKey}
                className="rounded-3xl p-5 relative overflow-hidden animate-scale-in"
                style={{
                    background: cardBg,
                    border: '1px solid rgba(232,89,26,0.12)',
                    boxShadow: '0 8px 40px rgba(232,89,26,0.08), 0 2px 10px rgba(0,0,0,0.03)',
                }}
            >
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,89,26,0.08), transparent 70%)' }} />

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(232,89,26,0.15)', borderTopColor: '#E8591A' }} />
                    </div>
                ) : !horoscope ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E8591A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        <p className="text-sm text-slate-400 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {t('horoscope.error')}
                        </p>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{ZODIACS.find(z => z.name === horoscope.sign)?.symbol}</span>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {t(`zodiac.${horoscope.sign}`)}
                                    </h3>
                                </div>
                            </div>
                            <span
                                className="text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider"
                                style={{ background: 'linear-gradient(135deg, #E8591A, #F47B40)', color: 'white', fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em' }}
                            >
                                {t('horoscope.daily_flow')}
                            </span>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed mb-5" style={{ fontFamily: "'Inter', sans-serif", lineHeight: '1.7' }}>
                            {isHindi ? horoscope.description_hi : horoscope.description}
                        </p>

                        <div className="pt-4 border-t" style={{ borderColor: 'rgba(232,89,26,0.08)' }}>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>
                                {t('horoscope.boosters')}
                            </p>
                            <div className="flex gap-2">
                                <div className="flex-1 flex items-center gap-1.5 px-2 py-2 rounded-2xl" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.15)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                    <div className="min-w-0">
                                        <p className="text-[9px] text-slate-400 uppercase font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>{t('horoscope.mood')}</p>
                                        <p className="text-xs font-bold text-amber-800 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{isHindi ? horoscope.mood_hi : horoscope.mood}</p>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center gap-1.5 px-2 py-2 rounded-2xl" style={{ background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.1)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M12 2l-2 7H3l6 4.5-2 7 6-4.5 6 4.5-2-7 6-4.5h-7z"/></svg>
                                    <div className="min-w-0">
                                        <p className="text-[9px] text-slate-400 uppercase font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>{t('horoscope.color')}</p>
                                        <p className="text-xs font-bold text-purple-800 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{isHindi ? horoscope.color_hi : horoscope.color}</p>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center gap-1.5 px-2 py-2 rounded-2xl" style={{ background: 'rgba(232,89,26,0.06)', border: '1px solid rgba(232,89,26,0.1)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8591A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    <div className="min-w-0">
                                        <p className="text-[9px] text-slate-400 uppercase font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>{t('horoscope.lucky_time')}</p>
                                        <p className="text-xs font-bold truncate" style={{ fontFamily: "'Inter', sans-serif", color: '#E8591A' }}>{horoscope.lucky_time}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
