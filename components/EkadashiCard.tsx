'use client'

import { EkadashiData } from '@/lib/mock-vedic'
import { useLanguage } from '@/components/LanguageContext'

interface Props {
    data: EkadashiData
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function EkadashiCard({ data }: Props) {
    const { t, language } = useLanguage()

    const fmtDate = (d: Date | string) => {
        const date = d instanceof Date ? d : new Date(d as string)
        if (isNaN(date.getTime())) return '—'
        return language === 'hi'
            ? `${date.getDate()} ${t('month.' + MONTH_NAMES[date.getMonth()])} ${date.getFullYear()}`
            : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }
    const fmtShort = (d: Date | string) => {
        const date = d instanceof Date ? d : new Date(d as string)
        if (isNaN(date.getTime())) return '—'
        return language === 'hi'
            ? `${date.getDate()} ${t('month.' + MONTH_NAMES[date.getMonth()])}`
            : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    }
    return (
        <div
            className="glass rounded-2xl overflow-hidden animate-fade-up delay-200 relative"
            style={{ opacity: 0, animationFillMode: 'forwards' }}
        >
            {/* Saffron accent top bar */}
            <div
                className="h-1"
                style={{
                    background: 'linear-gradient(90deg, #E8591A, #D4AF37, #E8591A)',
                    backgroundSize: '200% auto',
                    animation: 'shimmer 4s linear infinite',
                }}
            />

            <div className="p-6">
                {/* Title */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <p
                            className="text-xs tracking-widest uppercase text-slate-400 mb-1"
                            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.12em' }}
                        >
                            {t('ekadashi.upcoming')}
                        </p>
                        <h2
                            className="text-2xl font-light text-slate-800"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}
                        >
                            {data.name}
                        </h2>
                    </div>
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(232,89,26,0.1)', border: '1px solid rgba(232,89,26,0.15)' }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8591A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-2 4-6 6-6 10a6 6 0 0 0 12 0c0-4-4-6-6-10z"/><path d="M12 12v6"/></svg>
                    </div>
                </div>

                {/* Three data rows */}
                <div className="space-y-3">
                    {/* Ekadashi Date */}
                    <div
                        className="flex items-center justify-between py-3 px-4 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.5)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(212,175,55,0.15)' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </div>
                            <span
                                className="text-xs text-slate-500 uppercase tracking-wider"
                                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em' }}
                            >
                                {t('ekadashi.label')}
                            </span>
                        </div>
                        <span
                            className="text-sm font-medium text-slate-700"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            {fmtDate(data.ekadashiDateObj)}
                        </span>
                    </div>

                    {/* Fast Starts */}
                    <div
                        className="flex items-center justify-between py-3 px-4 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.5)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(232,89,26,0.1)' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8591A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><polyline points="8 6 12 2 16 6"/></svg>
                            </div>
                            <span
                                className="text-xs text-slate-500 uppercase tracking-wider"
                                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em' }}
                            >
                                {t('ekadashi.fast_begins')}
                            </span>
                        </div>
                        <span
                            className="text-sm font-medium text-slate-700"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            {fmtShort(data.ekadashiDateObj)} · {t('energy.sunrise')} ({data.sunriseStr})
                        </span>
                    </div>

                    {/* Parana Window — most prominent */}
                    <div
                        className="py-4 px-4 rounded-xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(232,89,26,0.08) 0%, rgba(212,175,55,0.08) 100%)',
                            border: '1px solid rgba(232,89,26,0.15)',
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(212,175,55,0.2)' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </div>
                            <span
                                className="text-xs text-slate-500 uppercase tracking-wider"
                                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em' }}
                            >
                                {t('ekadashi.parana')}
                            </span>
                        </div>
                        <div className="pl-10">
                            <p
                                className="text-2xl font-light"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    color: '#E8591A',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {data.paranaStart} – {data.paranaEnd}
                            </p>
                            <p
                                className="text-xs text-slate-500 mt-0.5"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                {fmtDate(data.paranaDateObj)} · {t('ekadashi.break_window')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Significance note */}
                {data.significance && (
                    <p
                        className="text-xs text-slate-400 text-center mt-4 italic leading-relaxed"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px' }}
                    >
                        "{data.significance}"
                    </p>
                )}
            </div>
        </div>
    )
}
