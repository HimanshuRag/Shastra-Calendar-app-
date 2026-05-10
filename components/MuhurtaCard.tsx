'use client'

import { useMemo } from 'react'
import { useLanguage } from '@/components/LanguageContext'

interface Muhurta {
    nameKey: string
    activitiesKey: string
    time: string
    quality: 'auspicious' | 'inauspicious' | 'neutral'
    icon: string
}

/** Parse "5:57 AM" → total minutes from midnight */
function parseSunriseMinutes(sunriseStr: string): number | null {
    const match = sunriseStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return null
    let h = parseInt(match[1], 10)
    const m = parseInt(match[2], 10)
    const period = match[3].toUpperCase()
    if (period === 'PM' && h !== 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    return h * 60 + m
}

function minsToTimeStr(totalMins: number): string {
    // Normalise to [0, 1439] — handles any negative or overflow input
    totalMins = ((totalMins % 1440) + 1440) % 1440
    const normalised = totalMins
    const h = Math.floor(normalised / 60)
    const m = normalised % 60
    const period = h >= 12 ? 'PM' : 'AM'
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`
}

// Muhurta rules based on Vara (weekday) and Tithi number
// Traditional Vedic muhurta system — simplified rule-based implementation
function getMuhurtas(date: Date, vara: string, tithiNumber: number, sunriseStr: string): Muhurta[] {
    const hour = (n: number) => {
        const h = Math.floor(n)
        const m = Math.round((n - h) * 60)
        const period = h >= 12 ? 'PM' : 'AM'
        const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
        return `${displayH}:${m.toString().padStart(2, '0')} ${period}`
    }

    // Abhijit Muhurta: ~11:45 AM – 12:30 PM daily (most auspicious)
    const abhijit: Muhurta = {
        nameKey: 'muhurta.abhijit_name',
        time: `${hour(11.75)} – ${hour(12.5)}`,
        quality: 'auspicious',
        activitiesKey: 'muhurta.abhijit_act',
        icon: 'sun',
    }

    // Brahma Muhurta: 96 min to 48 min before actual sunrise
    const sunriseMins = parseSunriseMinutes(sunriseStr)
    const brahmaTime = sunriseMins != null
        ? `${minsToTimeStr(sunriseMins - 96)} – ${minsToTimeStr(sunriseMins - 48)}`
        : '4:30 AM – 5:48 AM'
    const brahma: Muhurta = {
        nameKey: 'muhurta.brahma_name',
        time: brahmaTime,
        quality: 'auspicious',
        activitiesKey: 'muhurta.brahma_act',
        icon: 'flame',
    }

    // Vara-specific auspicious windows
    const varaWindows: Record<string, Muhurta> = {
        Ravivara:    { nameKey: 'muhurta.surya_hora',   time: `${hour(10)} – ${hour(11)}`,    quality: 'auspicious',   activitiesKey: 'muhurta.surya_act',   icon: 'sun' },
        Somavara:    { nameKey: 'muhurta.chandra_hora', time: `${hour(9)} – ${hour(10)}`,     quality: 'auspicious',   activitiesKey: 'muhurta.chandra_act', icon: 'moon' },
        Mangalavara: { nameKey: 'muhurta.mangal_hora',  time: `${hour(8)} – ${hour(9)}`,      quality: 'neutral',      activitiesKey: 'muhurta.mangal_act',  icon: 'mars' },
        Budhavara:   { nameKey: 'muhurta.budha_hora',   time: `${hour(7)} – ${hour(8)}`,      quality: 'auspicious',   activitiesKey: 'muhurta.budha_act',   icon: 'mercury' },
        Guruvara:    { nameKey: 'muhurta.guru_hora',    time: `${hour(10.5)} – ${hour(11.5)}`, quality: 'auspicious',  activitiesKey: 'muhurta.guru_act',    icon: 'jupiter' },
        Shukravara:  { nameKey: 'muhurta.shukra_hora',  time: `${hour(9.5)} – ${hour(10.5)}`, quality: 'auspicious',  activitiesKey: 'muhurta.shukra_act',  icon: 'venus' },
        Shanivara:   { nameKey: 'muhurta.shani_hora',   time: `${hour(8.5)} – ${hour(9.5)}`,  quality: 'inauspicious', activitiesKey: 'muhurta.shani_act',   icon: 'saturn' },
    }

    // Tithi-based note
    const tithiNotes: Record<number, Muhurta> = {
        1:  { nameKey: 'muhurta.pratipada_yoga', time: 'All day', quality: 'auspicious', activitiesKey: 'muhurta.pratipada_act', icon: 'sprout' },
        5:  { nameKey: 'muhurta.panchami_yoga',  time: 'All day', quality: 'auspicious', activitiesKey: 'muhurta.panchami_act',  icon: 'leaf' },
        11: { nameKey: 'muhurta.ekadashi_yoga',  time: 'All day', quality: 'auspicious', activitiesKey: 'muhurta.ekadashi_act',  icon: 'prayer' },
        15: { nameKey: 'muhurta.purnima_yoga',   time: 'All day', quality: 'auspicious', activitiesKey: 'muhurta.purnima_act',   icon: 'fullmoon' },
    }

    const results: Muhurta[] = [brahma, abhijit]
    const varaHora = varaWindows[vara]
    if (varaHora) results.push(varaHora)
    const tithiYoga = tithiNotes[tithiNumber]
    if (tithiYoga) results.push(tithiYoga)

    return results
}

function MuhurtaIcon({ iconType, color }: { iconType: string; color: string }) {
    const s = 20
    const sw = '1.5'
    const base = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className: 'flex-shrink-0 mt-1' }
    switch (iconType) {
        case 'sun': return <svg {...base}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        case 'flame': return <svg {...base}><path d="M12 2c-2 5-6 7-6 12a6 6 0 0 0 12 0c0-5-4-7-6-12z"/></svg>
        case 'moon': return <svg {...base}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        case 'mars': return <svg {...base}><circle cx="12" cy="14" r="6"/><path d="M18 2l4 4M22 2l-6 6"/></svg>
        case 'mercury': return <svg {...base}><circle cx="12" cy="10" r="4"/><path d="M12 14v4M8 18h8M12 18v4"/></svg>
        case 'jupiter': return <svg {...base}><path d="M3 7h7l-4 10h12M17 7v10"/></svg>
        case 'venus': return <svg {...base}><circle cx="12" cy="9" r="5"/><line x1="12" y1="14" x2="12" y2="22"/><line x1="9" y1="19" x2="15" y2="19"/></svg>
        case 'saturn': return <svg {...base}><circle cx="13" cy="13" r="5"/><path d="M6 6l2 2M4 10l3 1M7 4l1 3"/></svg>
        case 'sprout': return <svg {...base}><path d="M7 20h10M12 20v-6"/><path d="M12 14c-4 0-7-3-7-7 5 0 7 3 7 7z"/><path d="M12 14c4 0 7-3 7-7-5 0-7 3-7 7z"/></svg>
        case 'leaf': return <svg {...base}><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 22 2 22 2s-2.9 6.5-4.9 12.2A7 7 0 0 1 11 20z"/><path d="M4 21c1.5-3.5 4-5.5 7-6.5"/></svg>
        case 'prayer': return <svg {...base}><path d="M12 2v4M6 8l2 2M18 8l-2 2M12 22v-4"/><circle cx="12" cy="14" r="4"/></svg>
        case 'fullmoon': return <svg {...base}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill={color} fillOpacity="0.2"/></svg>
        default: return <svg {...base}><circle cx="12" cy="12" r="4"/></svg>
    }
}

interface Props {
    vara: string
    tithiNumber: number
    sunrise: string
}

export default function MuhurtaCard({ vara, tithiNumber, sunrise }: Props) {
    const { t } = useLanguage()
    const muhurtas = useMemo(() => getMuhurtas(new Date(), vara, tithiNumber, sunrise), [vara, tithiNumber, sunrise])

    const qualityColor = (q: Muhurta['quality']) => {
        if (q === 'auspicious') return { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', text: '#15803D' }
        if (q === 'inauspicious') return { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#B91C1C' }
        return { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.2)', text: '#92400E' }
    }

    return (
        <div
            className="rounded-2xl overflow-hidden animate-fade-up"
            style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(212,175,55,0.2)',
                backdropFilter: 'blur(12px)',
                animationFillMode: 'forwards',
                animationDelay: '150ms',
            }}
        >
            {/* Gold accent bar */}
            <div className="h-1" style={{ background: 'linear-gradient(90deg, #D4AF37, #E8591A, #D4AF37)', backgroundSize: '200% auto', animation: 'shimmer 4s linear infinite' }} />

            <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(232,89,26,0.1))' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div>
                        <p className="text-xs tracking-widest uppercase text-slate-400" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                            {t('muhurta.subtitle')}
                        </p>
                        <h2 className="text-xl font-light text-slate-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            {t('muhurta.title')}
                        </h2>
                    </div>
                </div>

                <div className="space-y-2.5">
                    {muhurtas.map((m) => {
                        const c = qualityColor(m.quality)
                        return (
                            <div
                                key={m.nameKey}
                                className="rounded-xl p-3.5 flex items-start gap-3"
                                style={{ background: c.bg, border: `1px solid ${c.border}` }}
                            >
                                <MuhurtaIcon iconType={m.icon} color={c.text} />
                                <div className="flex-1 min-w-0">
                                    {/* Name — full width, wraps freely */}
                                    <p className="font-semibold leading-snug" style={{ fontFamily: "'Cormorant Garamond', serif", color: c.text, fontSize: '15px' }}>
                                        {t(m.nameKey)}
                                    </p>
                                    {/* Time — own line, pill chip, never competes with name */}
                                    <p className="text-xs font-medium mt-1 mb-1" style={{ fontFamily: "'Inter', sans-serif", color: c.text, opacity: 0.85 }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '3px' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                        {m.time === 'All day' ? t('muhurta.all_day') : m.time}
                                    </p>
                                    {/* Activities */}
                                    <p className="text-xs text-slate-500 leading-snug" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {t(m.activitiesKey)}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <p className="text-center text-xs text-slate-400 mt-3 italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '12px' }}>
                    "कालः सर्वस्य भवति" · {t('muhurta.quote')}
                </p>
            </div>
        </div>
    )
}
