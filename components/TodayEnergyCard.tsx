'use client'

import { useEffect } from 'react'
import { VedicDay } from '@/lib/mock-vedic'
import { useLanguage } from '@/components/LanguageContext'

interface Props {
    data: VedicDay
}

// Module-level — prevents Android WebView GC from killing the utterance mid-speech
let _utterance: SpeechSynthesisUtterance | null = null

function speak(text: string, lang = 'hi-IN') {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    _utterance = new SpeechSynthesisUtterance(text)
    _utterance.lang = lang
    _utterance.rate = 0.85
    window.speechSynthesis.speak(_utterance)
}

function SpeakButton({ text }: { text: string }) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); speak(text) }}
            className="ml-1.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
            style={{ background: 'rgba(232,89,26,0.08)', border: '1px solid rgba(232,89,26,0.15)' }}
            title={`Pronounce "${text}"`}
            aria-label={`Pronounce ${text}`}
        >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#E8591A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        </button>
    )
}

    export default function TodayEnergyCard({ data }: Props) {
        const { t } = useLanguage()
        const { tithi, sunrise, sunset, nakshatra, vara, rahuKaal, isPanchak, isBhadra, karana } = data

        useEffect(() => {
            return () => {
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel()
                }
            }
        }, [])

        return (
        <div
            className="glass rounded-2xl p-6 animate-fade-up delay-100 relative overflow-hidden"
            style={{ animationFillMode: 'forwards' }}
        >
            {/* Soft gradient background blob */}
            <div
                className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(232,89,26,0.12) 0%, transparent 70%)' }}
            />
            <div
                className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)' }}
            />

            {/* Header row */}
            <div className="flex items-start justify-between mb-5 relative">
                <div>
                    <p
                        className="text-xs tracking-widest uppercase text-slate-400 mb-1"
                        style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.12em' }}
                    >
                        {t('energy.title')}
                    </p>
                    <div className="flex items-center gap-2">
                        <h2
                            className="text-4xl font-light text-slate-800"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}
                        >
                            {t(`tithi.${tithi.name}`)}
                        </h2>
                        <SpeakButton text={tithi.name} />
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {t(`paksha.${tithi.paksha}`)} · {t(`vara.${vara}`)}
                    </p>
                </div>
                {/* Tithi number badge */}
                <div
                    className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(232,89,26,0.1)', border: '1px solid rgba(232,89,26,0.15)' }}
                >
                    <span className="text-lg font-light" style={{ color: '#E8591A', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>
                        {tithi.number}
                    </span>
                    <span className="text-xs text-slate-400 uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px' }}>
                        {t('energy.tithi')}
                    </span>
                </div>
            </div>

            {/* Sun & Moon times */}
            <div className="grid grid-cols-3 gap-3 relative">
                {/* Sunrise */}
                <div className="rounded-xl p-3 flex flex-col items-center" style={{ background: 'rgba(255,255,255,0.5)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8591A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>
                    <p className="text-base font-medium text-slate-700" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
                        {sunrise}
                    </p>
                    <p className="text-xs text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {t('energy.sunrise')}
                    </p>
                </div>

                {/* Nakshatra center */}
                <div className="flex flex-col items-center justify-center w-full">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                        style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>
                    </div>
                    <p className="w-full text-center text-slate-500 leading-tight px-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', wordBreak: 'break-word' }}>
                        {t(`nakshatra.${nakshatra}`)}
                    </p>
                    <SpeakButton text={nakshatra} />
                    <p className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px' }}>
                        {t('energy.nakshatra')}
                    </p>
                </div>

                {/* Sunset */}
                <div className="rounded-xl p-3 flex flex-col items-center" style={{ background: 'rgba(255,255,255,0.5)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="16 6 12 10 8 6"/></svg>
                    <p className="text-base font-medium text-slate-700" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
                        {sunset}
                    </p>
                    <p className="text-xs text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {t('energy.sunset')}
                    </p>
                </div>
            </div>

            {/* Tithi end + Karana row */}
            <div className="flex items-center justify-between mt-4 relative">
                <p className="text-xs text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {t('energy.tithi_ends')}{' '}
                    <span className="font-medium text-slate-500">{tithi.endTime}</span>
                </p>
                <p className="text-xs text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {t('energy.karana')}{' '}
                    <span className="font-medium text-slate-500">{t(`karana.${karana}`)}</span>
                </p>
            </div>

            {/* ── Rahu Kaal, Panchak, Bhadra ── */}
            <div className="mt-4 space-y-3 relative">
                {/* Rahu Kaal */}
                <div
                    className="flex items-center justify-between px-4 py-3 rounded-2xl"
                    style={{
                        background: 'rgba(220,38,38,0.07)',
                        border: '1px solid rgba(220,38,38,0.18)',
                    }}
                >
                    <div className="flex items-center gap-2.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                        <span className="text-xs font-bold tracking-widest uppercase"
                            style={{ color: '#B91C1C', fontFamily: "'Inter', sans-serif" }}>
                            {t('energy.rahu_kaal')}
                        </span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#DC2626', fontFamily: "'Inter', sans-serif" }}>
                        {rahuKaal.start} – {rahuKaal.end}
                    </span>
                </div>

                {/* Panchak badge — only when active */}
                {isPanchak && (
                    <div
                        className="flex items-center justify-between px-4 py-3 rounded-2xl"
                        style={{
                            background: 'rgba(234,88,12,0.07)',
                            border: '1px solid rgba(234,88,12,0.18)',
                        }}
                    >
                        <div className="flex items-center gap-2.5">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            <span className="text-xs font-bold tracking-widest uppercase"
                                style={{ color: '#C2410C', fontFamily: "'Inter', sans-serif" }}>
                                {t('energy.panchak')}
                            </span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: '#EA580C', fontFamily: "'Inter', sans-serif" }}>
                            {t('energy.panchak_warn')}
                        </span>
                    </div>
                )}

                {/* Bhadra (Vishti Karana) — only when active */}
                {isBhadra && (
                    <div
                        className="flex items-center justify-between py-2.5 px-3.5 rounded-xl"
                        style={{ background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.2)' }}
                    >
                        <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif", color: '#374151', letterSpacing: '0.06em' }}>
                                {t('energy.bhadra')}
                            </span>
                        </div>
                        <span className="text-xs font-medium" style={{ fontFamily: "'Inter', sans-serif", color: '#374151' }}>
                            {t('energy.bhadra_warn')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
