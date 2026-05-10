'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/LanguageContext'
import { useRouter } from 'next/navigation'
import { trackEvent, setUserProperty } from '@/lib/analytics'

const DEITIES = [
    { id: 'Shiva', emoji: 'शि', hi: 'शिव' },
    { id: 'Krishna', emoji: 'कृ', hi: 'कृष्ण' },
    { id: 'Hanuman', emoji: 'हन', hi: 'हनुमान' },
    { id: 'Ganesha', emoji: 'गण', hi: 'गणेश' },
    { id: 'Durga', emoji: 'दु', hi: 'दुर्गा' },
    { id: 'Lakshmi', emoji: 'लक', hi: 'लक्ष्मी' },
    { id: 'Rama', emoji: 'रा', hi: 'राम' },
    { id: 'Vishnu', emoji: 'वि', hi: 'विष्णु' },
    { id: 'Saraswati', emoji: 'सर', hi: 'सरस्वती' },
    { id: 'Kali', emoji: 'का', hi: 'काली' },
    { id: 'Kartikeya', emoji: 'कार', hi: 'कार्तिकेय' },
    { id: 'Surya', emoji: 'सू', hi: 'सूर्य' },
]

const ZODIACS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
const ZODIAC_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']

function DeityIcon({ name, isSelected }: { name: string; isSelected: boolean }) {
    const c = isSelected ? '#E8591A' : '#9CA3AF'
    const s = 20
    const base = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: '1.8', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
    switch (name) {
        case 'Shiva': // Trident
            return <svg {...base}><line x1="12" y1="2" x2="12" y2="22"/><line x1="7" y1="2" x2="7" y2="8"/><line x1="17" y1="2" x2="17" y2="8"/><path d="M7 8c0 3 5 3 5 0"/><path d="M12 8c0 3 5 3 5 0"/></svg>
        case 'Krishna': // Flute
            return <svg {...base}><line x1="4" y1="18" x2="20" y2="8"/><circle cx="8" cy="15" r="1" fill={c}/><circle cx="12" cy="13" r="1" fill={c}/><circle cx="16" cy="11" r="1" fill={c}/><path d="M3 14c2-1 3 1 5 0"/></svg>
        case 'Hanuman': // Mace/Gada
            return <svg {...base}><line x1="12" y1="10" x2="12" y2="22"/><circle cx="12" cy="6" r="4"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
        case 'Ganesha': // Elephant/Om
            return <svg {...base}><circle cx="12" cy="10" r="6"/><path d="M12 16v5"/><path d="M8 10c0-2 2-4 4-4"/><path d="M14 12c1 2 3 4 5 3"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
        case 'Durga': // Lotus
            return <svg {...base}><circle cx="12" cy="12" r="3" fill={c} fillOpacity="0.15"/><path d="M12 2c0 4-3 7-3 10"/><path d="M12 2c0 4 3 7 3 10"/><path d="M5 9c3 0 5 2 7 3"/><path d="M19 9c-3 0-5 2-7 3"/><path d="M12 15v6"/></svg>
        case 'Lakshmi': // Diya/Lamp
            return <svg {...base}><path d="M8 14h8l2 6H6l2-6z"/><path d="M12 14c-2-3-4-5-4-8a4 4 0 0 1 8 0c0 3-2 5-4 8z"/><path d="M12 3v-1"/></svg>
        case 'Rama': // Bow & Arrow
            return <svg {...base}><path d="M4 20C4 12 12 4 20 4"/><line x1="4" y1="20" x2="16" y2="8"/><polyline points="12 8 16 8 16 12"/></svg>
        case 'Vishnu': // Chakra
            return <svg {...base}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2" fill={c}/><line x1="12" y1="4" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="20"/><line x1="4" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="20" y2="12"/></svg>
        case 'Saraswati': // Book/Veena
            return <svg {...base}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/><line x1="9" y1="8" x2="16" y2="8"/><line x1="9" y1="12" x2="14" y2="12"/></svg>
        case 'Kali': // Lightning
            return <svg {...base}><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        case 'Kartikeya': // Spear/Vel
            return <svg {...base}><line x1="12" y1="2" x2="12" y2="22"/><path d="M8 6l4-4 4 4"/><path d="M9 6l3 3 3-3"/></svg>
        case 'Surya': // Sun
            return <svg {...base}><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>
        default:
            return <svg {...base}><circle cx="12" cy="12" r="4"/></svg>
    }
}

interface SettingsPageProps {
    notifTime: string
    notifEnabled: boolean
    onNotifChange: (enabled: boolean, time: string) => void
    darkMode: boolean
    onDarkModeToggle: () => void
}

export default function SettingsPage({ notifTime, notifEnabled, onNotifChange, darkMode, onDarkModeToggle }: SettingsPageProps) {
    const { language, setLanguage, t } = useLanguage()
    const router = useRouter()

    const [deity, setDeity] = useState('Krishna')
    const [zodiac, setZodiac] = useState('Aries')

    // Restore from localStorage after mount (avoids SSR crash)
    useEffect(() => {
        const VALID_DEITIES = new Set(['Shiva','Krishna','Hanuman','Ganesha','Durga','Lakshmi','Rama','Vishnu','Saraswati','Kali','Kartikeya','Surya'])
        const VALID_ZODIACS = new Set(['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'])

        const rawDeity = localStorage.getItem('shastra-deity') || 'Krishna'
        setDeity(VALID_DEITIES.has(rawDeity) ? rawDeity : 'Krishna')

        const rawZodiac = localStorage.getItem('shastra-zodiac') || 'Aries'
        setZodiac(VALID_ZODIACS.has(rawZodiac) ? rawZodiac : 'Aries')

    }, [])
    const [localNotifEnabled, setLocalNotifEnabled] = useState(notifEnabled)
    const [localNotifTime, setLocalNotifTime] = useState(notifTime)

    // M-07: re-sync local state when parent props change (e.g. after permission grant)
    useEffect(() => { setLocalNotifEnabled(notifEnabled) }, [notifEnabled])
    useEffect(() => { setLocalNotifTime(notifTime) }, [notifTime])
    const [showResetConfirm, setShowResetConfirm] = useState(false)

    const saveDeity = (d: string) => {
        setDeity(d)
        localStorage.setItem('shastra-deity', d)
        trackEvent('deity_selected', { deity: d })
    }

    const saveZodiac = (z: string) => {
        setZodiac(z)
        localStorage.setItem('shastra-zodiac', z)
        trackEvent('zodiac_selected', { zodiac: z })
        setUserProperty('zodiac_sign', z)
    }

    const handleNotifToggle = () => {
        const next = !localNotifEnabled
        setLocalNotifEnabled(next)
        trackEvent('notification_toggled', { enabled: next })
        onNotifChange(next, localNotifTime)
    }

    // M-08: renamed param from 't' to 'timeValue' — 't' shadowed the translation function
    const handleTimeChange = (timeValue: string) => {
        if (!timeValue || !/^\d{2}:\d{2}$/.test(timeValue)) return
        setLocalNotifTime(timeValue)
        if (localNotifEnabled) onNotifChange(true, timeValue)
    }

    const handleReset = () => {
        trackEvent('reset_triggered')
        const ownedKeys = [
            'shastra-onboarded', 'shastra-birthdate', 'shastra-zodiac',
            'shastra-deity', 'shastra-language', 'shastra-notif-enabled',
            'shastra-notif-time', 'shastra-favourites', 'shastra-streak',
            'shastra-last-open', 'shastra-welcome-seen', 'shastra-dark',
            'shastra-lat', 'shastra-lng', 'shastra-streak-hint-seen',
            'shastra-name', 'shastra-city'
        ]
        ownedKeys.forEach(k => localStorage.removeItem(k))
        router.replace('/onboarding/')
    }

    const SectionHeader = ({ title }: { title: string }) => (
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.12em' }}>
            {title}
        </p>
    )

    const ToggleRow = ({ label, sub, value, onToggle }: { label: string; sub?: string; value: boolean; onToggle: () => void }) => (
        <div className="flex items-center justify-between py-3.5 px-4 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div>
                <p className="text-sm font-medium text-slate-700" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{sub}</p>}
            </div>
            <button
                onClick={onToggle}
                role="switch"
                aria-checked={value}
                className="relative transition-all duration-300 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500"
                style={{ width: 44, height: 24, borderRadius: 12, background: value ? '#E8591A' : '#D1D5DB' }}
                aria-label={`Toggle ${label}`}
            >
                <div
                    className="absolute top-1 transition-all duration-300 w-4 h-4 rounded-full bg-white shadow-sm"
                    style={{ left: 4, transform: value ? 'translateX(20px)' : 'translateX(0px)' }}
                />
            </button>
        </div>
    )

    return (
        <div className="px-4 pb-4 pt-2 max-w-lg mx-auto space-y-6 animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>

            {/* ── Appearance ── */}
            <div>
                <SectionHeader title={t('settings.appearance')} />
                <ToggleRow
                    label={t('settings.dark_mode')}
                    sub={t('settings.dark_sub')}
                    value={darkMode}
                    onToggle={onDarkModeToggle}
                />
                <div className="flex items-center justify-between py-3.5 px-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div>
                        <p className="text-sm font-medium text-slate-700" style={{ fontFamily: "'Inter', sans-serif" }}>{t('settings.language')}</p>
                        <p className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{t('settings.language_sub')}</p>
                    </div>
                    <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(232,89,26,0.2)' }}>
                        {(['en', 'hi'] as const).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => {
                                    setLanguage(lang)
                                    trackEvent('language_changed', { language: lang })
                                    setUserProperty('language', lang)
                                }}
                                className="px-4 py-1.5 text-sm font-medium transition-all duration-200"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    background: language === lang ? '#E8591A' : 'transparent',
                                    color: language === lang ? '#fff' : '#6B7280',
                                }}
                            >
                                {lang === 'en' ? 'EN' : 'हि'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Notifications ── */}
            <div>
                <SectionHeader title={t('settings.notif_section')} />
                <ToggleRow
                    label={t('settings.notif_label')}
                    sub={t('settings.notif_sub')}
                    value={localNotifEnabled}
                    onToggle={handleNotifToggle}
                />
                {localNotifEnabled && (
                    <div className="flex items-center justify-between py-3.5 px-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <p className="text-sm font-medium text-slate-700" style={{ fontFamily: "'Inter', sans-serif" }}>{t('settings.notif_time')}</p>
                        <input
                            type="time"
                            value={localNotifTime}
                            onChange={(e) => handleTimeChange(e.target.value)}
                            className="text-sm font-medium rounded-lg px-3 py-1.5"
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                color: '#E8591A',
                                border: '1px solid rgba(232,89,26,0.25)',
                                background: 'rgba(232,89,26,0.05)',
                                outline: 'none',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* ── Ishta Devata ── */}
            <div>
                <SectionHeader title={t('settings.deity_section')} />
                <div className="grid grid-cols-3 gap-2.5">
                    {DEITIES.map((d) => {
                        const isSelected = deity === d.id
                        return (
                            <button
                                key={d.id}
                                onClick={() => saveDeity(d.id)}
                                className="flex flex-col items-center justify-center rounded-2xl py-3.5 px-1 transition-all duration-300"
                                style={{
                                    background: isSelected
                                        ? 'linear-gradient(135deg, rgba(232,89,26,0.12) 0%, rgba(212,175,55,0.08) 100%)'
                                        : 'rgba(255,255,255,0.7)',
                                    border: isSelected ? '2px solid #E8591A' : '1.5px solid rgba(0,0,0,0.05)',
                                    transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                                    boxShadow: isSelected ? '0 4px 16px rgba(232,89,26,0.15)' : '0 1px 4px rgba(0,0,0,0.03)',
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5"
                                    style={{
                                        background: isSelected ? 'rgba(232,89,26,0.12)' : 'rgba(0,0,0,0.03)',
                                        border: isSelected ? '1px solid rgba(232,89,26,0.2)' : '1px solid rgba(0,0,0,0.04)',
                                    }}
                                >
                                    <DeityIcon name={d.id} isSelected={isSelected} />
                                </div>
                                <span className="text-xs font-semibold" style={{ fontFamily: "'Inter', sans-serif", color: isSelected ? '#E8591A' : '#6B7280' }}>
                                    {language === 'hi' ? d.hi : d.id}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ── Zodiac Sign ── */}
            <div>
                <SectionHeader title={t('settings.zodiac_section')} />
                <div className="grid grid-cols-4 gap-2">
                    {ZODIACS.map((z, i) => {
                        const isSelected = zodiac === z
                        return (
                            <button
                                key={z}
                                onClick={() => saveZodiac(z)}
                                className="flex flex-col items-center justify-center rounded-xl py-3 transition-all duration-200"
                                style={{
                                    background: isSelected ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.7)',
                                    border: isSelected ? '1.5px solid #D4AF37' : '1px solid rgba(0,0,0,0.06)',
                                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                                }}
                            >
                                <span className="text-xl mb-1">{ZODIAC_SYMBOLS[i]}</span>
                                <span className="text-xs font-medium text-center leading-tight" style={{ fontFamily: "'Inter', sans-serif", color: isSelected ? '#92400E' : '#6B7280', fontSize: '9px', maxWidth: '100%', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                    {t(`zodiac.${z}`)}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ── About ── */}
            <div>
                <SectionHeader title={t('settings.about')} />
                <div className="rounded-xl px-4 py-4 space-y-3" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500" style={{ fontFamily: "'Inter', sans-serif" }}>{t('settings.version')}</p>
                        <p className="text-sm font-medium text-slate-700" style={{ fontFamily: "'Inter', sans-serif" }}>1.0.0</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500" style={{ fontFamily: "'Inter', sans-serif" }}>{t('settings.calculations')}</p>
                        <p className="text-sm font-medium text-slate-700" style={{ fontFamily: "'Inter', sans-serif" }}>Astronomy Engine</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500" style={{ fontFamily: "'Inter', sans-serif" }}>{t('settings.privacy_policy')}</p>
                        <button
                            onClick={() => router.push('/privacy/')}
                            className="text-sm font-medium transition-opacity active:opacity-60"
                            style={{ fontFamily: "'Inter', sans-serif", color: '#E8591A' }}
                        >
                            {t('settings.view')} →
                        </button>
                    </div>
                    <div className="h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />
                    <p className="text-xs text-center text-slate-400 italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        "सर्वे भवन्तु सुखिनः" — May all beings be happy
                    </p>
                </div>
            </div>

            {/* ── Reset ── */}
            <div>
                {!showResetConfirm ? (
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        className="w-full py-3.5 rounded-xl text-sm font-medium transition-all"
                        style={{ fontFamily: "'Inter', sans-serif", color: '#EF4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
                    >
                        {t('settings.reset')}
                    </button>
                ) : (
                    <div className="rounded-xl px-4 py-4 space-y-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <p className="text-sm text-center text-red-600 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{t('settings.reset_confirm')}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif", background: 'rgba(255,255,255,0.8)', color: '#374151', border: '1px solid rgba(0,0,0,0.1)' }}>
                                {t('settings.cancel')}
                            </button>
                            <button onClick={handleReset} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{ fontFamily: "'Inter', sans-serif", background: '#EF4444' }}>
                                {t('settings.reset_yes')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
