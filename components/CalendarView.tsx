'use client'

import { useState, useMemo, useEffect } from 'react'
import { getDayData, DayData } from '@/lib/vedic-calendar'
import { useLanguage } from '@/components/LanguageContext'
import { useDarkMode } from '@/hooks/useDarkMode'
import { trackEvent } from '@/lib/analytics'

interface CalendarViewProps {
    initialYear?: number
    initialMonth?: number
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const VARA_KEYS = ['Ravivara','Somavara','Mangalavara','Budhavara','Guruvara','Shukravara','Shanivara']

// Rahu Kaal segment index (1-based) per weekday — mnemonic: "Mother Saw Father Wearing The Turban Systematically"
// Sunday=5 (not 8) per traditional assignment (~1:30–3:00 PM)
const RAHU_KAAL_SEG: Record<number, number> = { 0: 5, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 }

function fmtTime(d?: Date): string {
    if (!d) return '--'
    try { return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }) }
    catch { return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
}

function calcRahuKaal(sunrise?: Date, sunset?: Date, weekday?: number): { start: string; end: string } {
    if (!sunrise || !sunset || weekday === undefined) return { start: '--', end: '--' }
    const segMs = (sunset.getTime() - sunrise.getTime()) / 8
    const segIdx = RAHU_KAAL_SEG[weekday] - 1
    const start = new Date(sunrise.getTime() + segIdx * segMs)
    const end = new Date(start.getTime() + segMs)
    return { start: fmtTime(start), end: fmtTime(end) }
}

// Find consecutive Panchak runs in the month
function getPanchakRanges(monthData: Map<number, DayData>, daysInMonth: number): { start: number; end: number }[] {
    const ranges: { start: number; end: number }[] = []
    let runStart: number | null = null
    for (let d = 1; d <= daysInMonth; d++) {
        const isPanchak = monthData.get(d)?.isPanchak ?? false
        if (isPanchak && runStart === null) runStart = d
        if (!isPanchak && runStart !== null) { ranges.push({ start: runStart, end: d - 1 }); runStart = null }
    }
    if (runStart !== null) ranges.push({ start: runStart, end: daysInMonth })
    return ranges
}

export default function CalendarView({
    initialYear,
    initialMonth,
}: CalendarViewProps) {
    const { t } = useLanguage()
    const isDark = useDarkMode()
    // Initialise directly from props (or current date) — avoids a one-frame flash of wrong month
    const [year, setYear] = useState(() => initialYear ?? new Date().getFullYear())
    const [month, setMonth] = useState(() => {
        const raw = initialMonth ?? new Date().getMonth()
        return Math.max(0, Math.min(11, raw))
    })
    const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date())
    const [selectedData, setSelectedData] = useState<ReturnType<typeof getDayData> | null>(() => {
        try { return getDayData(new Date()) } catch { return null }
    })

    const [today, setToday] = useState(() => new Date())
    useEffect(() => {
        const now = new Date()
        const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
        const id = setTimeout(() => setToday(new Date()), msUntilMidnight)
        return () => clearTimeout(id)
    }, [today])

    const { daysInMonth, startDow } = useMemo(() => ({
        daysInMonth: year > 0 ? new Date(year, month + 1, 0).getDate() : 31,
        startDow: year > 0 ? new Date(year, month, 1).getDay() : 0,
    }), [year, month])

    // Compute all day data for the current month at once
    const monthData = useMemo(() => {
        const map = new Map<number, DayData>()
        for (let d = 1; d <= daysInMonth; d++) {
            try {
                const data = getDayData(new Date(year, month, d))
                if (data) map.set(d, data)
            } catch {
                // Skip days where astronomy calculation fails rather than blanking the whole calendar
            }
        }
        return map
    }, [year, month, daysInMonth])

    const panchakRanges = useMemo(() => getPanchakRanges(monthData, daysInMonth), [monthData, daysInMonth])

    // True when the last panchak run reaches the final day and bleeds into next month
    const panchakContinuesNext = useMemo(() => {
        if (panchakRanges.length === 0) return false
        const last = panchakRanges[panchakRanges.length - 1]
        if (last.end !== daysInMonth) return false
        try {
            return getDayData(new Date(year, month + 1, 1))?.isPanchak ?? false
        } catch {
            return false
        }
    }, [panchakRanges, daysInMonth, year, month])

    const handleDateClick = (day: number) => {
        const date = new Date(year, month, day)
        setSelectedDate(date)
        setSelectedData(monthData.get(day) ?? null)
        trackEvent('calendar_date_selected', { date: `${year}-${month + 1}-${day}` })
    }

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
    }

    const cells = useMemo(() => {
        const c: (number | null)[] = []
        for (let i = 0; i < startDow; i++) c.push(null)
        for (let d = 1; d <= daysInMonth; d++) c.push(d)
        while (c.length % 7 !== 0) c.push(null)
        return c
    }, [startDow, daysInMonth])

    const getDayStyle = (day: number) => {
        const data = monthData.get(day)
        const date = new Date(year, month, day)
        const isToday = date.toDateString() === today.toDateString()
        const isSelected = selectedDate?.toDateString() === date.toDateString()

        // Dark-mode-aware text colours — inline style={{ color }} bypasses Tailwind dark: variants
        const defaultText = isDark ? '#C9A97A' : '#4A5568'

        if (isSelected) return { bg: '#E8591A', text: '#ffffff', ring: 'none', dot: null, panchak: false }
        if (isToday) return { bg: 'rgba(232,89,26,0.12)', text: '#E8591A', ring: '2px solid #E8591A', dot: null, panchak: data?.isPanchak ?? false }
        if (data?.isPanchak) return { bg: isDark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.07)', text: isDark ? '#FCA5A5' : '#B91C1C', ring: 'none', dot: '#EF4444', panchak: true }
        if (data?.isEkadashi) return { bg: isDark ? 'rgba(147,51,234,0.14)' : 'rgba(147,51,234,0.08)', text: isDark ? '#C4B5FD' : '#6D28D9', ring: 'none', dot: '#7C3AED', panchak: false }
        if (data?.isPurnima) return { bg: isDark ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.12)', text: isDark ? '#FCD34D' : '#92400E', ring: 'none', dot: '#D4AF37', panchak: false }
        if (data?.isAmavasya) return { bg: isDark ? 'rgba(100,116,139,0.15)' : 'rgba(74,85,104,0.08)', text: isDark ? '#94A3B8' : '#374151', ring: 'none', dot: '#6B7280', panchak: false }
        if (data?.isFestival) return { bg: isDark ? 'rgba(232,89,26,0.12)' : 'rgba(232,89,26,0.06)', text: isDark ? '#FB923C' : '#C2410C', ring: 'none', dot: '#E8591A', panchak: false }
        return { bg: 'transparent', text: defaultText, ring: 'none', dot: null, panchak: false }
    }

    const formatDate = (date: Date) =>
        `${t('vara.' + VARA_KEYS[date.getDay()])}, ${date.getDate()} ${t('month.' + MONTH_NAMES[date.getMonth()])}`

    // Rahu Kaal for selected date
    const selectedRahu = selectedDate && selectedData
        ? calcRahuKaal(selectedData.sunrise, selectedData.sunset, selectedDate.getDay())
        : null

    return (
        <div className="glass rounded-2xl" style={{ opacity: 1 }}>
            {/* ── Header ── */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(232,89,26,0.1)' }}>
                <button onClick={prevMonth} className="w-11 h-11 rounded-lg flex items-center justify-center transition-all active:scale-95" style={{ background: 'rgba(232,89,26,0.08)' }} aria-label="Previous month">
                    <span style={{ color: '#E8591A', fontSize: '18px' }}>‹</span>
                </button>
                <div className="text-center">
                    <h3 className="text-lg font-light text-slate-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {t('month.' + MONTH_NAMES[month])} {year}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{t('calendar.title')}</p>
                </div>
                <button onClick={nextMonth} className="w-11 h-11 rounded-lg flex items-center justify-center transition-all active:scale-95" style={{ background: 'rgba(232,89,26,0.08)' }} aria-label="Next month">
                    <span style={{ color: '#E8591A', fontSize: '18px' }}>›</span>
                </button>
            </div>

            {/* ── Panchak Banner (Feature 3) ── */}
            {panchakRanges.length > 0 && (
                <div className="px-4 py-2.5 flex items-start gap-2" style={{ background: 'rgba(220,38,38,0.05)', borderBottom: '1px solid rgba(220,38,38,0.1)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    <div className="flex-1">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif", color: '#B91C1C', letterSpacing: '0.08em' }}>
                            {t('calendar.panchak_this_month')}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {panchakRanges.map((r, idx) => {
                                const isLast = idx === panchakRanges.length - 1
                                const label = r.start === r.end ? `${r.start}` : `${r.start}–${r.end}`
                                return (
                                    <span
                                        key={`${r.start}-${r.end}`}
                                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                                        style={{ background: 'rgba(220,38,38,0.1)', color: '#B91C1C', fontFamily: "'Inter', sans-serif" }}
                                    >
                                        {label} {t('month_short.' + MONTH_SHORT[month])}
                                        {isLast && panchakContinuesNext ? ' →' : ''}
                                    </span>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Legend ── */}
            <div
                className="flex items-center gap-3 py-3"
                style={{
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    overflowX: 'auto',
                    paddingLeft: 20,
                    paddingRight: 20,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {[
                    { label: t('calendar.legend_purnima'),  color: '#D4AF37', shape: 'circle' },
                    { label: t('calendar.legend_ekadashi'), color: '#7C3AED', shape: 'diamond' },
                    { label: t('calendar.legend_panchak'),  color: '#EF4444', shape: 'ring' },
                    { label: t('calendar.legend_amavasya'), color: isDark ? '#94A3B8' : '#6B7280', shape: 'circle' },
                ].map(({ label, color, shape }) => (
                    <div key={label} className="flex items-center gap-1.5 flex-shrink-0">
                        {shape === 'diamond' ? (
                            <span style={{
                                display: 'inline-block', width: 10, height: 10,
                                background: color, borderRadius: '2px',
                                transform: 'rotate(45deg)', flexShrink: 0,
                            }} />
                        ) : shape === 'ring' ? (
                            <span style={{
                                display: 'inline-block', width: 11, height: 11,
                                borderRadius: '50%', border: `2.5px solid ${color}`,
                                flexShrink: 0,
                            }} />
                        ) : (
                            <span style={{
                                display: 'inline-block', width: 10, height: 10,
                                borderRadius: '50%', background: color, flexShrink: 0,
                            }} />
                        )}
                        <span style={{
                            color: isDark ? '#9CA3AF' : '#6B7280',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '11px',
                            whiteSpace: 'nowrap',
                        }}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Days of week ── */}
            <div className="grid grid-cols-7 px-3 pt-3">
                {DAYS_OF_WEEK.map(d => (
                    <div key={d} className="text-center py-1">
                        <span className="text-xs font-medium uppercase" style={{ color: '#9CA3AF', fontFamily: "'Inter', sans-serif", letterSpacing: '0.06em', fontSize: '10px' }}>
                            {t(`dow.${d}`)}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Calendar Grid (Features 2 & 6) ── */}
            <div className="grid grid-cols-7 gap-1 px-3 pb-3">
                {cells.map((day, idx) => {
                    if (!day) return <div key={`empty-${year}-${month}-${idx}`} />
                    const data = monthData.get(day)
                    const style = getDayStyle(day)
                    const isToday = new Date(year, month, day).toDateString() === today.toDateString()

                    const a11yLabel = (() => {
                        const parts = [`${day} ${MONTH_NAMES[month]}`]
                        const d = monthData.get(day)
                        if (d?.isEkadashi) parts.push('Ekadashi')
                        if (d?.isPurnima) parts.push('Purnima')
                        if (d?.isAmavasya) parts.push('Amavasya')
                        if (d?.isFestival && d.festival) parts.push(d.festival)
                        if (d?.isBhadra) parts.push('Bhadra')
                        return parts.join(', ')
                    })()

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className="relative flex flex-col items-center justify-center rounded-xl py-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
                            style={{
                                background: style.bg,
                                outline: style.ring !== 'none' ? style.ring : undefined,
                                outlineOffset: '-2px',
                                minHeight: '44px',
                                cursor: 'pointer',
                            }}
                            aria-label={a11yLabel}
                        >
                            <span
                                className="text-sm font-medium leading-none"
                                style={{ color: style.text, fontFamily: "'Inter', sans-serif", fontWeight: isToday ? 600 : 400 }}
                            >
                                {day}
                            </span>

                            {/* Dot row: main dot + Bhadra secondary dot (Feature 6) */}
                            {(style.dot || data?.isBhadra) && (
                                <div className="flex items-center gap-0.5 mt-0.5">
                                    {style.dot && <div className="w-1.5 h-1.5 rounded-full" style={{ background: style.dot }} />}
                                    {data?.isBhadra && (
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#6B7280' }} title="Bhadra" />
                                    )}
                                </div>
                            )}

                            {/* Tithi abbreviation */}
                            {data && (
                                <span
                                    className="text-center leading-tight mt-0.5"
                                    style={{
                                        color: style.text === '#ffffff' ? 'rgba(255,255,255,0.8)' : '#9CA3AF',
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: '8px',
                                        opacity: 0.55,
                                    }}
                                >
                                    {data.tithiNumber}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* ── Selected Day Detail Panel (Features 1 & 4) ── */}
            {selectedDate && (
                <div className="mx-4 mb-4 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(232,89,26,0.15)', background: 'rgba(255,255,255,0.7)' }}>
                    {/* Detail header */}
                    <div
                        className="px-4 py-3 flex items-center justify-between"
                        style={{ background: 'linear-gradient(135deg, rgba(232,89,26,0.1), rgba(212,175,55,0.08))', borderBottom: '1px solid rgba(232,89,26,0.1)' }}
                    >
                        <div>
                            <p className="text-base font-light text-slate-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                {formatDate(selectedDate)}
                            </p>
                            {selectedData ? (
                                <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {t(`paksha.${selectedData.paksha}`)} · {t(`vara.${selectedData.vara}`)}
                                </p>
                            ) : (
                                <p className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {t('calendar.not_available')}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {selectedData?.isPanchak && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>}
                            {selectedData?.isBhadra && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                            {selectedData?.isFestival && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8591A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-2 4-6 6-6 10a6 6 0 0 0 12 0c0-4-4-6-6-10z"/><path d="M12 12v6"/></svg>}
                            {selectedData?.isPurnima && !selectedData?.isFestival && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="#D4AF37" fillOpacity="0.2"/></svg>}
                            {selectedData?.isAmavasya && !selectedData?.isFestival && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6" fill="#6B7280" fillOpacity="0.15"/></svg>}
                        </div>
                    </div>

                    {selectedData ? (
                        <div className="px-4 py-3 space-y-2.5">
                            {/* Festival banner */}
                            {selectedData.isFestival && selectedData.festival && (
                                <div
                                    className="rounded-lg px-3 py-2 flex items-center gap-2"
                                    style={{
                                        background: selectedData.isEkadashi ? 'rgba(124,58,237,0.08)' : selectedData.isPurnima ? 'rgba(212,175,55,0.12)' : 'rgba(232,89,26,0.08)',
                                        border: `1px solid ${selectedData.isEkadashi ? 'rgba(124,58,237,0.2)' : selectedData.isPurnima ? 'rgba(212,175,55,0.3)' : 'rgba(232,89,26,0.15)'}`,
                                    }}
                                >
                                    <span className="text-base flex-shrink-0">
                                        {selectedData.isEkadashi ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M6 8l2 2M18 8l-2 2M12 22v-4"/><circle cx="12" cy="14" r="4"/></svg> : selectedData.isPurnima ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="#D4AF37" fillOpacity="0.2"/></svg> : selectedData.isAmavasya ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6" fill="#6B7280" fillOpacity="0.15"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>}
                                    </span>
                                    <p className="text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif", color: selectedData.isEkadashi ? '#6D28D9' : selectedData.isPurnima ? '#92400E' : '#C2410C' }}>
                                        {selectedData.festival}
                                    </p>
                                </div>
                            )}

                            {/* Tithi · Nakshatra · Karana */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(232,89,26,0.05)' }}>
                                    <p className="text-xs text-slate-400 mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{t('energy.tithi')}</p>
                                    <p className="text-sm font-medium text-slate-700" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px' }}>
                                        {t(`tithi.${selectedData.tithi}`)}
                                    </p>
                                    <p className="text-xs text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        #{selectedData.tithiNumber}
                                    </p>
                                </div>
                                <div className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(212,175,55,0.06)' }}>
                                    <p className="text-xs text-slate-400 mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{t('energy.nakshatra')}</p>
                                    <p className="text-sm font-medium text-slate-700" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px' }}>
                                        {selectedData.nakshatra ? t(`nakshatra.${selectedData.nakshatra}`) : '—'}
                                    </p>
                                </div>
                                <div className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(99,102,241,0.05)' }}>
                                    <p className="text-xs text-slate-400 mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{t('energy.karana')?.replace(':', '')}</p>
                                    <p className="text-sm font-medium text-slate-700" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px' }}>
                                        {t(`karana.${selectedData.karana}`)}
                                    </p>
                                </div>
                            </div>

                            {/* Rahu Kaal (Feature 4) */}
                            {selectedRahu && (
                                <div className="rounded-lg px-3 py-2.5 flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                    <div className="flex items-center gap-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif", color: '#B91C1C', letterSpacing: '0.06em' }}>
                                            {t('energy.rahu_kaal')}
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif", color: '#B91C1C' }}>
                                        {selectedRahu.start} – {selectedRahu.end}
                                    </p>
                                </div>
                            )}

                            {/* Panchak warning */}
                            {selectedData.isPanchak && (
                                <div className="rounded-lg px-3 py-2.5 flex items-start gap-2" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                    <div>
                                        <p className="text-xs font-semibold" style={{ color: '#B91C1C', fontFamily: "'Inter', sans-serif" }}>
                                            {t('energy.panchak')}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {t('calendar.panchak_detail')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Bhadra warning */}
                            {selectedData.isBhadra && (
                                <div className="rounded-lg px-3 py-2.5 flex items-start gap-2" style={{ background: 'rgba(107,114,128,0.07)', border: '1px solid rgba(107,114,128,0.18)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <div>
                                        <p className="text-xs font-semibold" style={{ color: '#374151', fontFamily: "'Inter', sans-serif" }}>
                                            {t('energy.bhadra')}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {t('calendar.bhadra_detail')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Ekadashi note */}
                            {selectedData.isEkadashi && (
                                <div className="rounded-lg px-3 py-2.5 flex items-start gap-2" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M12 2v4M6 8l2 2M18 8l-2 2M12 22v-4"/><circle cx="12" cy="14" r="4"/></svg>
                                    <div>
                                        <p className="text-xs font-semibold" style={{ color: '#6D28D9', fontFamily: "'Inter', sans-serif" }}>
                                            {t('calendar.fasting_day')}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {t('calendar.fasting_desc')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="px-4 py-3">
                            <p className="text-sm text-slate-400 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                                {t('calendar.coming_soon')}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
