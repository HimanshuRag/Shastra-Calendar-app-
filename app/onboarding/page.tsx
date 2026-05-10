'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { trackEvent, setUserProperty } from '@/lib/analytics'

const DEITIES = [
    { name: 'Shiva', emoji: 'शि', nameHi: 'शिव' },
    { name: 'Krishna', emoji: 'कृ', nameHi: 'कृष्ण' },
    { name: 'Hanuman', emoji: 'हन', nameHi: 'हनुमान' },
    { name: 'Ganesha', emoji: 'गण', nameHi: 'गणेश' },
    { name: 'Durga', emoji: 'दु', nameHi: 'दुर्गा' },
    { name: 'Lakshmi', emoji: 'लक', nameHi: 'लक्ष्मी' },
    { name: 'Rama', emoji: 'रा', nameHi: 'राम' },
    { name: 'Vishnu', emoji: 'वि', nameHi: 'विष्णु' },
    { name: 'Saraswati', emoji: 'सर', nameHi: 'सरस्वती' },
    { name: 'Kali', emoji: 'का', nameHi: 'काली' },
    { name: 'Kartikeya', emoji: 'कार', nameHi: 'कार्तिकेय' },
    { name: 'Surya', emoji: 'सू', nameHi: 'सूर्य' },
]

const ZODIAC_RANGES: { name: string; symbol: string; from: [number, number]; to: [number, number] }[] = [
    { name: 'Capricorn',   symbol: '♑', from: [12, 22], to: [1, 19] },
    { name: 'Aquarius',    symbol: '♒', from: [1, 20],  to: [2, 18] },
    { name: 'Pisces',      symbol: '♓', from: [2, 19],  to: [3, 20] },
    { name: 'Aries',       symbol: '♈', from: [3, 21],  to: [4, 19] },
    { name: 'Taurus',      symbol: '♉', from: [4, 20],  to: [5, 20] },
    { name: 'Gemini',      symbol: '♊', from: [5, 21],  to: [6, 20] },
    { name: 'Cancer',      symbol: '♋', from: [6, 21],  to: [7, 22] },
    { name: 'Leo',         symbol: '♌', from: [7, 23],  to: [8, 22] },
    { name: 'Virgo',       symbol: '♍', from: [8, 23],  to: [9, 22] },
    { name: 'Libra',       symbol: '♎', from: [9, 23],  to: [10, 22] },
    { name: 'Scorpio',     symbol: '♏', from: [10, 23], to: [11, 21] },
    { name: 'Sagittarius', symbol: '♐', from: [11, 22], to: [12, 21] },
]

function getSunSign(dateStr: string): { name: string; symbol: string } {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return { name: 'Aries', symbol: '♈' }
    const month = d.getMonth() + 1 // 1-12
    const day = d.getDate()

    for (const z of ZODIAC_RANGES) {
        const [fm, fd] = z.from
        const [tm, td] = z.to
        // Handle year-wrap (Capricorn: Dec 22 – Jan 19)
        if (fm > tm) {
            if ((month === fm && day >= fd) || (month === tm && day <= td)) {
                return { name: z.name, symbol: z.symbol }
            }
        } else {
            if ((month === fm && day >= fd) || (month > fm && month < tm) || (month === tm && day <= td)) {
                return { name: z.name, symbol: z.symbol }
            }
        }
    }
    return { name: 'Aries', symbol: '♈' }
}

function OnboardDeityIcon({ name, isSelected }: { name: string; isSelected: boolean }) {
    const c = isSelected ? '#E8591A' : '#9CA3AF'
    const s = 20
    const base = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: '1.8', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
    switch (name) {
        case 'Shiva': return <svg {...base}><line x1="12" y1="2" x2="12" y2="22"/><line x1="7" y1="2" x2="7" y2="8"/><line x1="17" y1="2" x2="17" y2="8"/><path d="M7 8c0 3 5 3 5 0"/><path d="M12 8c0 3 5 3 5 0"/></svg>
        case 'Krishna': return <svg {...base}><line x1="4" y1="18" x2="20" y2="8"/><circle cx="8" cy="15" r="1" fill={c}/><circle cx="12" cy="13" r="1" fill={c}/><circle cx="16" cy="11" r="1" fill={c}/><path d="M3 14c2-1 3 1 5 0"/></svg>
        case 'Hanuman': return <svg {...base}><line x1="12" y1="10" x2="12" y2="22"/><circle cx="12" cy="6" r="4"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
        case 'Ganesha': return <svg {...base}><circle cx="12" cy="10" r="6"/><path d="M12 16v5"/><path d="M8 10c0-2 2-4 4-4"/><path d="M14 12c1 2 3 4 5 3"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
        case 'Durga': return <svg {...base}><circle cx="12" cy="12" r="3" fill={c} fillOpacity="0.15"/><path d="M12 2c0 4-3 7-3 10"/><path d="M12 2c0 4 3 7 3 10"/><path d="M5 9c3 0 5 2 7 3"/><path d="M19 9c-3 0-5 2-7 3"/><path d="M12 15v6"/></svg>
        case 'Lakshmi': return <svg {...base}><path d="M8 14h8l2 6H6l2-6z"/><path d="M12 14c-2-3-4-5-4-8a4 4 0 0 1 8 0c0 3-2 5-4 8z"/><path d="M12 3v-1"/></svg>
        case 'Rama': return <svg {...base}><path d="M4 20C4 12 12 4 20 4"/><line x1="4" y1="20" x2="16" y2="8"/><polyline points="12 8 16 8 16 12"/></svg>
        case 'Vishnu': return <svg {...base}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2" fill={c}/><line x1="12" y1="4" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="20"/><line x1="4" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="20" y2="12"/></svg>
        case 'Saraswati': return <svg {...base}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/><line x1="9" y1="8" x2="16" y2="8"/><line x1="9" y1="12" x2="14" y2="12"/></svg>
        case 'Kali': return <svg {...base}><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        case 'Kartikeya': return <svg {...base}><line x1="12" y1="2" x2="12" y2="22"/><path d="M8 6l4-4 4 4"/><path d="M9 6l3 3 3-3"/></svg>
        case 'Surya': return <svg {...base}><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>
        default: return <svg {...base}><circle cx="12" cy="12" r="4"/></svg>
    }
}

export default function OnboardingPage() {
    const router = useRouter()
    const lang = typeof window !== 'undefined' ? (localStorage.getItem('shastra-language') || 'en') : 'en'
    const [step, setStep] = useState(1)
    const [userName, setUserName] = useState('')
    const [birthDate, setBirthDate] = useState('')
    const [dateError, setDateError] = useState('')
    const [selectedDeity, setSelectedDeity] = useState<string | null>(null)

    const sunSign = birthDate && !dateError ? getSunSign(birthDate) : null

    useEffect(() => {
        try {
            const onboarded = localStorage.getItem('shastra-onboarded')
            if (onboarded === 'true') router.replace('/dashboard/')
        } catch { /* storage unavailable */ }
    }, []) // eslint-disable-line

    const validateDate = (value: string): string => {
        if (!value) return 'Please enter your birth date to continue'
        const d = new Date(value)
        if (isNaN(d.getTime())) return 'Please enter a valid date'
        const year = d.getFullYear()
        if (year < 1900) return 'Please enter a year after 1900'
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (d >= today) return 'Birth date must be in the past'
        const age = today.getFullYear() - d.getFullYear()
        const hasBirthdayOccurred =
            today.getMonth() > d.getMonth() ||
            (today.getMonth() === d.getMonth() && today.getDate() >= d.getDate())
        const actualAge = hasBirthdayOccurred ? age : age - 1
        if (actualAge < 5) return lang === 'hi' ? 'आयु कम से कम 5 वर्ष होनी चाहिए' : 'You must be at least 5 years old'
        return ''
    }

    const handleDateChange = (value: string) => {
        setBirthDate(value)
        setDateError(value ? validateDate(value) : '')
    }

    const handleNameContinue = () => {
        // name is optional — always advance
        setStep(2)
    }

    const handleNext = () => {
        const err = validateDate(birthDate)
        if (err) { setDateError(err); return }
        setStep(3)
    }

    const handleFinish = () => {
        const err = validateDate(birthDate)
        if (err || !selectedDeity) return
        const sign = getSunSign(birthDate)
        localStorage.setItem('shastra-onboarded', 'true')
        localStorage.setItem('shastra-zodiac', sign.name)
        localStorage.setItem('shastra-deity', selectedDeity)
        const trimmedName = userName.trim()
        if (trimmedName) {
            const safeName = trimmedName
                .replace(/[\u0000-\u001F\u007F\u200B-\u200D\u202A-\u202E\uFEFF<>"'`\\]/g, '')
                .slice(0, 40)
            localStorage.setItem('shastra-name', safeName)
        }
        trackEvent('onboarding_completed', { deity: selectedDeity, zodiac: sign.name })
        setUserProperty('zodiac_sign', sign.name)
        setUserProperty('ishta_devata', selectedDeity)
        const storedName = localStorage.getItem('shastra-name')
        if (storedName) setUserProperty('name', storedName)
        router.replace('/dashboard/')
    }

    const today = new Date()
    const maxDate = `${today.getFullYear() - 5}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    return (
        <main className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--bg-base, #FAF7F2)' }}>
            {/* Ambient blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(232,89,26,0.08) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
                {/* Progress */}
                <div className="w-full max-w-sm mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(232,89,26,0.1)' }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ background: 'linear-gradient(90deg, #E8591A, #F47B40)', width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }} />
                        </div>
                        <span className="text-xs font-bold text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {step}/3
                        </span>
                    </div>
                </div>

                {/* ── Step 1: Name ── */}
                {step === 1 && (
                    <div className="max-w-sm w-full text-center animate-fade-up">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(232,89,26,0.1)', border: '1px solid rgba(232,89,26,0.2)' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8591A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800 }}>
                            What's your name?
                        </h1>
                        <p className="text-sm text-slate-400 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
                            We'll greet you personally on your spiritual journey
                        </p>

                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value.slice(0, 40))}
                            placeholder="Your name"
                            maxLength={40}
                            className="w-full text-center text-lg font-semibold py-5 px-4 rounded-3xl outline-none transition-all mb-6"
                            style={{
                                background: 'rgba(255,255,255,0.8)',
                                border: userName.trim() ? '2px solid #E8591A' : '2px solid rgba(0,0,0,0.06)',
                                color: '#1a1a2e',
                                fontFamily: "'Inter', sans-serif",
                                boxShadow: userName.trim() ? '0 4px 20px rgba(232,89,26,0.1)' : 'none',
                            }}
                        />

                        <button
                            onClick={handleNameContinue}
                            disabled={userName.trim().length === 0}
                            className="w-full py-4 px-6 rounded-2xl font-bold text-white text-sm transition-all mb-3"
                            style={{
                                background: userName.trim() ? 'linear-gradient(135deg, #E8591A, #F47B40)' : 'rgba(0,0,0,0.1)',
                                boxShadow: userName.trim() ? '0 8px 30px rgba(232,89,26,0.3)' : 'none',
                                fontFamily: "'Inter', sans-serif",
                                cursor: userName.trim() ? 'pointer' : 'not-allowed',
                                opacity: userName.trim() ? 1 : 0.5,
                                color: userName.trim() ? '#fff' : '#9CA3AF',
                            }}
                        >
                            Continue →
                        </button>
                        <button
                            onClick={() => setStep(2)}
                            className="text-xs text-slate-400 underline underline-offset-2 cursor-pointer transition-opacity hover:opacity-70"
                            style={{ fontFamily: "'Inter', sans-serif", background: 'none', border: 'none' }}
                        >
                            Skip
                        </button>
                    </div>
                )}

                {/* ── Step 2: Birth Date ── */}
                {step === 2 && (
                    <div className="max-w-sm w-full text-center animate-fade-up">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(232,89,26,0.1)', border: '1px solid rgba(232,89,26,0.2)' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8591A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800 }}>
                            When were you born?
                        </h1>
                        <p className="text-sm text-slate-400 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
                            We'll reveal your sun sign and personalize your journey
                        </p>

                        <div className="relative mb-1">
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                max={maxDate}
                                min="1900-01-01"
                                className="w-full text-center text-lg font-semibold py-5 px-4 rounded-3xl outline-none transition-all"
                                style={{
                                    background: 'rgba(255,255,255,0.8)',
                                    border: dateError ? '2px solid #EF4444' : birthDate ? '2px solid #E8591A' : '2px solid rgba(0,0,0,0.06)',
                                    color: '#1a1a2e',
                                    fontFamily: "'Inter', sans-serif",
                                    boxShadow: dateError ? '0 4px 20px rgba(239,68,68,0.1)' : birthDate ? '0 4px 20px rgba(232,89,26,0.1)' : 'none',
                                }}
                            />
                        </div>
                        {dateError ? (
                            <p className="text-xs text-red-500 text-center mb-3 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                ⚠ {dateError}
                            </p>
                        ) : (
                            <div className="mb-3" />
                        )}

                        {/* Sun sign preview */}
                        {sunSign && (
                            <div
                                className="rounded-2xl py-3 px-5 mb-6 flex items-center justify-center gap-3 animate-fade-up"
                                style={{ background: 'rgba(232,89,26,0.07)', border: '1px solid rgba(232,89,26,0.15)' }}
                            >
                                <span className="text-2xl">{sunSign.symbol}</span>
                                <div className="text-left">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em' }}>Your Sun Sign</p>
                                    <p className="text-base font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#E8591A', fontSize: '18px' }}>{sunSign.name}</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleNext}
                            className="w-full py-4 px-6 rounded-2xl font-bold text-white text-sm transition-all"
                            style={{
                                background: birthDate && !dateError ? 'linear-gradient(135deg, #E8591A, #F47B40)' : 'rgba(0,0,0,0.1)',
                                boxShadow: birthDate && !dateError ? '0 8px 30px rgba(232,89,26,0.3)' : 'none',
                                fontFamily: "'Inter', sans-serif",
                                cursor: 'pointer',
                                opacity: birthDate && !dateError ? 1 : 0.5,
                                color: birthDate && !dateError ? '#fff' : '#9CA3AF',
                            }}
                        >
                            Continue →
                        </button>
                    </div>
                )}

                {/* ── Step 3: Ishta Devata ── */}
                {step === 3 && (
                    <div className="max-w-sm w-full text-center animate-fade-up">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800 }}>
                            Your Ishta Devata
                        </h1>
                        <p className="text-sm text-slate-400 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Which deity resonates with your heart?
                        </p>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {DEITIES.map((deity) => {
                                const isSelected = selectedDeity === deity.name
                                return (
                                    <button
                                        key={deity.name}
                                        onClick={() => setSelectedDeity(deity.name)}
                                        className="rounded-2xl py-4 px-2 flex flex-col items-center gap-1.5 transition-all duration-300"
                                        style={{
                                            background: isSelected
                                                ? 'linear-gradient(135deg, rgba(232,89,26,0.1), rgba(212,175,55,0.08))'
                                                : 'rgba(255,255,255,0.7)',
                                            border: isSelected ? '2px solid #E8591A' : '1.5px solid rgba(0,0,0,0.04)',
                                            boxShadow: isSelected ? '0 4px 20px rgba(232,89,26,0.15)' : '0 2px 8px rgba(0,0,0,0.02)',
                                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                        }}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{
                                                background: isSelected ? 'rgba(232,89,26,0.12)' : 'rgba(0,0,0,0.03)',
                                                border: isSelected ? '1px solid rgba(232,89,26,0.2)' : '1px solid rgba(0,0,0,0.04)',
                                            }}
                                        >
                                            <OnboardDeityIcon name={deity.name} isSelected={isSelected} />
                                        </div>
                                        <span className="text-xs font-bold" style={{ fontFamily: "'Inter', sans-serif", color: isSelected ? '#E8591A' : '#6B7280' }}>
                                            {deity.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {deity.nameHi}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(2)}
                                className="py-4 px-6 rounded-2xl font-bold text-sm"
                                style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(0,0,0,0.06)', color: '#6B7280', fontFamily: "'Inter', sans-serif" }}
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleFinish}
                                disabled={!selectedDeity}
                                className="flex-1 py-4 px-6 rounded-2xl font-bold text-white text-sm transition-all"
                                style={{
                                    background: selectedDeity ? 'linear-gradient(135deg, #E8591A, #F47B40)' : 'rgba(0,0,0,0.1)',
                                    boxShadow: selectedDeity ? '0 8px 30px rgba(232,89,26,0.3)' : 'none',
                                    fontFamily: "'Inter', sans-serif",
                                    cursor: selectedDeity ? 'pointer' : 'not-allowed',
                                    opacity: selectedDeity ? 1 : 0.5,
                                }}
                            >
                                Start My Journey ✦
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
