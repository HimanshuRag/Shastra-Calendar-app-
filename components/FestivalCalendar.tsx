'use client'

import { useState, useEffect, useMemo } from 'react'
import { getDayData } from '@/lib/vedic-calendar'
import { useLanguage } from '@/components/LanguageContext'

interface FestivalEntry {
    date: Date
    label: string
    type: 'ekadashi' | 'purnima' | 'amavasya' | 'festival'
    pakshaKey: string   // e.g. 'Shukla' | 'Krishna'
    tithiKey: string    // e.g. 'Pratipada' | 'Ekadashi'
}

function getFestivalsForYear(year: number): FestivalEntry[] {
    const entries: FestivalEntry[] = []
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const data = getDayData(new Date(d))
        if (!data) continue

        if (data.isMajorFestival && data.festival) {
            const type: FestivalEntry['type'] =
                data.isPurnima ? 'purnima' :
                data.isAmavasya ? 'amavasya' :
                'festival'
            entries.push({
                date: new Date(d),
                label: data.festival,
                type,
                pakshaKey: data.paksha,
                tithiKey: data.tithi,
            })
        } else if (data.isEkadashi) {
            entries.push({ date: new Date(d), label: 'Ekadashi', type: 'ekadashi', pakshaKey: data.paksha, tithiKey: 'Ekadashi' })
        } else if (data.isPurnima) {
            entries.push({ date: new Date(d), label: data.festival || 'Purnima', type: 'purnima', pakshaKey: data.paksha, tithiKey: 'Purnima' })
        } else if (data.isAmavasya) {
            entries.push({ date: new Date(d), label: data.festival || 'Amavasya', type: 'amavasya', pakshaKey: data.paksha, tithiKey: 'Amavasya' })
        }
    }
    return entries
}

const TYPE_CONFIG = {
    ekadashi: { icon: 'ekadashi', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', color: '#6D28D9', badgeKey: 'festival.badge_fast' },
    purnima:  { icon: 'purnima',  bg: 'rgba(212,175,55,0.1)',  border: 'rgba(212,175,55,0.3)',  color: '#92400E', badgeKey: 'festival.badge_full_moon' },
    amavasya: { icon: 'amavasya', bg: 'rgba(74,85,104,0.08)',  border: 'rgba(74,85,104,0.2)',   color: '#374151', badgeKey: 'festival.badge_new_moon' },
    festival: { icon: 'festival', bg: 'rgba(232,89,26,0.08)',  border: 'rgba(232,89,26,0.2)',   color: '#C2410C', badgeKey: 'festival.badge_festival' },
}

const MONTH_KEYS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DOW_KEYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function FestivalIcon({ type, color }: { type: string; color: string }) {
    const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: '1.5', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className: 'flex-shrink-0' }
    switch (type) {
        case 'ekadashi': return <svg {...base}><path d="M12 2v4M6 8l2 2M18 8l-2 2M12 22v-4"/><circle cx="12" cy="14" r="4"/></svg>
        case 'purnima': return <svg {...base}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill={color} fillOpacity="0.2"/></svg>
        case 'amavasya': return <svg {...base}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6" fill={color} fillOpacity="0.15"/></svg>
        case 'festival': return <svg {...base}><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>
        default: return <svg {...base}><circle cx="12" cy="12" r="4"/></svg>
    }
}

export default function FestivalCalendar() {
    const { t } = useLanguage()
    const year = new Date().getFullYear()
    const [today, setToday] = useState(() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
    })
    useEffect(() => {
        const now = new Date()
        const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
        const id = setTimeout(() => setToday(new Date()), msUntilMidnight)
        return () => clearTimeout(id)
    }, [today])

    const [filter, setFilter] = useState<'all' | 'ekadashi' | 'purnima' | 'amavasya' | 'festival'>('all')
    const [search, setSearch] = useState('')
    const [festivals, setFestivals] = useState<FestivalEntry[]>([])
    const [festLoading, setFestLoading] = useState(true)

    // Defer heavy 365-day astronomy loop to after first paint so UI isn't blocked
    useEffect(() => {
        setFestLoading(true)
        let cancelled = false
        const run = () => {
            if (cancelled) return
            try {
                setFestivals(getFestivalsForYear(year))
            } catch {
                setFestivals([])
            } finally {
                if (!cancelled) setFestLoading(false)
            }
        }
        let idleId: ReturnType<typeof setTimeout> | number
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            idleId = (window as any).requestIdleCallback(run, { timeout: 2000 })
        } else {
            idleId = setTimeout(run, 16)
        }
        return () => {
            cancelled = true
            if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
                (window as any).cancelIdleCallback(idleId)
            } else {
                clearTimeout(idleId)
            }
        }
    }, [year])

    const upcoming = useMemo(() => {
        return festivals
            .filter(f => {
                const fd = new Date(f.date); fd.setHours(0,0,0,0)
                if (fd < today) return false
                if (filter !== 'all' && f.type !== filter) return false
                if (search) {
                    const q = search.toLowerCase()
                    const matchLabel = f.label.toLowerCase().includes(q)
                    const matchTithi = f.tithiKey.toLowerCase().includes(q)
                    if (!matchLabel && !matchTithi) return false
                }
                return true
            })
    }, [festivals, filter, search, today])

    // Group by month
    const grouped = useMemo(() => {
        const map: Record<string, FestivalEntry[]> = {}
        upcoming.forEach(f => {
            // Use English key for grouping (language-independent), translate at render
            const key = MONTH_KEYS[f.date.getMonth()] + ' ' + f.date.getFullYear()
            if (!map[key]) map[key] = []
            map[key].push(f)
        })
        return map
    }, [upcoming])

    return (
        <div className="pb-4 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
            {/* Search */}
            <div className="relative mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('festival.search')}
                    aria-label="Search festivals"
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm"
                    style={{ fontFamily: "'Inter', sans-serif", background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)', outline: 'none', color: '#374151' }}
                />
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1 hide-scrollbar">
                {(['all','festival','ekadashi','purnima','amavasya'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        aria-pressed={filter === f}
                        className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: '0.04em',
                            background: filter === f ? '#E8591A' : 'rgba(255,255,255,0.8)',
                            color: filter === f ? '#fff' : '#6B7280',
                            border: filter === f ? 'none' : '1px solid rgba(0,0,0,0.08)',
                        }}
                    >
                        {f === 'all' ? t('festival.all') : t(`festival.${f}`)}
                    </button>
                ))}
            </div>

            {/* Festival list grouped by month */}
            {festLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(232,89,26,0.15)', borderTopColor: '#E8591A' }} />
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-400 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>{t('festival.none')}</p>
                </div>
            ) : (
                Object.entries(grouped).map(([month, items]) => (
                    <div key={month} className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 px-1" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.12em' }}>
                            {/* month key is "Apr 2026" — translate month part, keep year */}
                            {t('month_short.' + month.split(' ')[0])} {month.split(' ')[1]}
                        </p>
                        <div className="space-y-2">
                            {items.map((f) => {
                                const cfg = TYPE_CONFIG[f.type] ?? TYPE_CONFIG.festival
                                const isToday = f.date.toDateString() === today.toDateString()
                                const dayName = t('dow.' + DOW_KEYS[f.date.getDay()])
                                const dayNum = f.date.getDate()

                                return (
                                    <div
                                        key={`${f.type}-${f.label}-${isNaN(f.date.getTime()) ? `${f.type}-${f.label}` : f.date.getTime()}`}
                                        className="flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all"
                                        style={{
                                            background: isToday ? 'rgba(232,89,26,0.1)' : cfg.bg,
                                            border: `1px solid ${isToday ? 'rgba(232,89,26,0.3)' : cfg.border}`,
                                        }}
                                    >
                                        {/* Date badge */}
                                        <div className="flex flex-col items-center justify-center flex-shrink-0 rounded-lg" style={{ width: 40, height: 40, background: isToday ? '#E8591A' : 'rgba(255,255,255,0.7)' }}>
                                            <span className="text-xs font-bold leading-none" style={{ color: isToday ? '#fff' : cfg.color, fontFamily: "'Inter', sans-serif" }}>{dayNum}</span>
                                            <span className="text-xs leading-none mt-0.5" style={{ color: isToday ? 'rgba(255,255,255,0.8)' : '#9CA3AF', fontFamily: "'Inter', sans-serif", fontSize: '9px' }}>{dayName}</span>
                                        </div>

                                        {/* Icon */}
                                        <FestivalIcon type={cfg.icon} color={cfg.color} />

                                        {/* Label */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate" style={{ fontFamily: "'Cormorant Garamond', serif", color: cfg.color, fontSize: '15px' }}>
                                                {f.label}
                                            </p>
                                            <p className="text-xs text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {t(`paksha.${f.pakshaKey}`)} {t(`tithi.${f.tithiKey}`)}
                                                {isToday && ` · ${t('festival.today')}`}
                                            </p>
                                        </div>

                                        {/* Badge */}
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.7)', color: cfg.color, fontFamily: "'Inter', sans-serif", fontSize: '9px', letterSpacing: '0.04em' }}>
                                            {t(cfg.badgeKey)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
