'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import Header from '@/components/Header'
import TodayEnergyCard from '@/components/TodayEnergyCard'
import EkadashiCard from '@/components/EkadashiCard'
import DailyOracle from '@/components/DailyOracle'
import HoroscopeSection from '@/components/HoroscopeSection'
import MuhurtaCard from '@/components/MuhurtaCard'
import CalendarView from '@/components/CalendarView'
import SanskritFooter from '@/components/SanskritFooter'
import FestivalCalendar from '@/components/FestivalCalendar'
import SettingsPage from '@/components/SettingsPage'
import BottomNav, { TabId } from '@/components/BottomNav'
import { getMockVedicDay, getNextEkadashi } from '@/lib/mock-vedic'
import { useLanguage } from '@/components/LanguageContext'
import { trackEvent, setUserProperty } from '@/lib/analytics'

// Module-level timer ref to avoid storing timer IDs in localStorage.
// NOTE (CRIT-3): This is intentionally module-level rather than a useRef because
// scheduleNotification is called outside React's render cycle (e.g. from the
// recursive setTimeout callback). The cleanup in the useEffect return (see below)
// calls clearTimeout(notifTimerId) which is sufficient to prevent leaks across
// re-mounts. A NaN-delay guard in scheduleNotification prevents stale/invalid fires.
let notifTimerId: ReturnType<typeof setTimeout> | undefined

function getDeityMessage(deity: string): string {
    const messages: Record<string, string> = {
        Shiva: 'Monday is especially auspicious for Shiva. Consider lighting a diya and chanting Om Namah Shivaya.',
        Krishna: 'Wednesday carries Krishna\'s energy. Recite the Bhagavad Gita or sing a bhajan today.',
        Hanuman: 'Tuesday is Hanuman\'s day. Recite the Hanuman Chalisa for strength and protection.',
        Ganesha: 'Wednesday blesses Ganesha devotees. Begin any new work today with a prayer to Vighnaharta.',
        Durga: 'Friday honours Shakti. Light incense and offer red flowers to Maa Durga today.',
        Lakshmi: 'Friday is Lakshmi\'s day. Keep your space clean and light a ghee lamp in the evening.',
        Rama: 'Wednesday and Saturday carry Rama\'s grace. Recite the Rama Raksha Stotra for peace.',
        Vishnu: 'Thursday is auspicious for Vishnu. Offer Tulsi leaves and recite Om Namo Narayanaya.',
        Saraswati: 'Wednesday blesses seekers of knowledge. Spend time in study or creative work today.',
        Kali: 'Tuesday and Saturday honour Kali. Offer hibiscus and seek her protection from obstacles.',
        Kartikeya: 'Tuesday is Kartikeya\'s day. Seek his blessings for courage and victory.',
        Surya: 'Sunday belongs to Surya. Offer water to the rising sun and practice Surya Namaskar.',
    }
    return messages[deity] || 'May your practice bring you peace and wisdom today.'
}

function scheduleNotification(enabled: boolean, time: string) {
    if (typeof window === 'undefined') return
    // Clear any existing scheduled notif
    clearTimeout(notifTimerId)

    if (!enabled || typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return

    // HIGH-7: validate format before parsing to prevent NaN delays
    if (!/^\d{2}:\d{2}$/.test(time)) return
    const [hStr, mStr] = time.split(':')
    const h = parseInt(hStr, 10)
    const m = parseInt(mStr, 10)
    if (isNaN(h) || isNaN(m) || h > 23 || m > 59) return

    const now = new Date()
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0)
    if (target <= now) target.setDate(target.getDate() + 1)
    const delay = target.getTime() - now.getTime()

    notifTimerId = setTimeout(() => {
        new Notification('Shastra Life ✧', {
            body: 'Good morning! Your daily Panchang is ready.',
            icon: '/icons/icon-192.png',
        })
        scheduleNotification(enabled, time)
    }, delay)
}

// HIGH-9: Lightweight error boundary to isolate card-level failures
class CardErrorBoundary extends React.Component<
  { children: React.ReactNode; label?: string },
  { hasError: boolean }
> {
  constructor(props: any) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return (
      <div className="rounded-2xl px-4 py-3 text-sm text-center" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444', fontFamily: "'Inter', sans-serif" }}>
        {this.props.label || 'Content unavailable'} — tap to reload
      </div>
    )
    return this.props.children
  }
}

export default function DashboardPage() {
    const router = useRouter()
    const { lat, lng, t } = useLanguage()
    const [ready, setReady] = useState(false)
    const [activeTab, setActiveTab] = useState<TabId>('today')
    const [tabVisible, setTabVisible] = useState(true)
    // Store tab-switch timer so rapid taps cancel the previous one (H-14)
    const tabTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const welcomeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    // Guard: Notification API is not available in all WebView / TWA contexts
    const notifSupported = useMemo(
        () => typeof window !== 'undefined' && 'Notification' in window,
        []
    )

    // Notification state
    const [notifEnabled, setNotifEnabled] = useState(false)
    const [notifTime, setNotifTime] = useState('07:00')
    const [notifError, setNotifError] = useState('')

    // Dark mode state
    const [darkMode, setDarkMode] = useState(false)

    // Welcome screen state (Issue 10)
    const [showWelcome, setShowWelcome] = useState(false)
    const [welcomeDeity, setWelcomeDeity] = useState('')
    const [userName, setUserName] = useState('')

    // Deity personalisation state (Issue 17)
    const [userDeity, setUserDeity] = useState('')

    useEffect(() => {
        const onboarded = localStorage.getItem('shastra-onboarded')
        if (!onboarded) {
            // C-07: redirect to /onboarding, not '/' which is a dead end
            router.replace('/onboarding')
            return
        }

        // Show welcome screen on first-ever dashboard load
        const hasSeenWelcome = localStorage.getItem('shastra-welcome-seen')
        if (!hasSeenWelcome) {
            const welcomeDeityName = localStorage.getItem('shastra-deity') || 'the divine'
            setWelcomeDeity(welcomeDeityName)
            setShowWelcome(true)
            localStorage.setItem('shastra-welcome-seen', 'true')
            // Auto-dismiss after 3 seconds
            welcomeTimerRef.current = setTimeout(() => setShowWelcome(false), 3000)
        }

        // Read user name
        setUserName(localStorage.getItem('shastra-name') || '')

        // Restore notification prefs
        const savedEnabled = localStorage.getItem('shastra-notif-enabled') === 'true'
        // HIGH-7: validate stored time to prevent NaN delays in scheduleNotification
        const rawTime = localStorage.getItem('shastra-notif-time') || '07:00'
        const savedTime = /^\d{2}:\d{2}$/.test(rawTime) ? rawTime : '07:00'
        setNotifEnabled(savedEnabled)
        setNotifTime(savedTime)
        if (savedEnabled) scheduleNotification(true, savedTime)

        // Restore dark mode — apply class here on mount
        const savedDark = localStorage.getItem('shastra-dark') === 'true'
        setDarkMode(savedDark)
        if (savedDark) document.documentElement.classList.add('dark')

        // Track app open + user properties
        trackEvent('app_opened')
        const savedLang = localStorage.getItem('shastra-language') || 'en'
        const savedZodiac = localStorage.getItem('shastra-zodiac') || 'Aries'
        const savedDeity = localStorage.getItem('shastra-deity') || 'Krishna'
        setUserProperty('language', savedLang)
        setUserProperty('zodiac_sign', savedZodiac)

        setReady(true)
        setUserDeity(localStorage.getItem('shastra-deity') || '')

        // M-05: clean up the .dark class when this page unmounts (e.g. after reset)
        return () => {
            clearTimeout(tabTimerRef.current)
            clearTimeout(notifTimerId)
            clearTimeout(welcomeTimerRef.current)
            // Only remove if this page was the one that added it;
            // read current stored pref rather than closing over savedDark
            if (localStorage.getItem('shastra-dark') !== 'true') {
                document.documentElement.classList.remove('dark')
            }
        }
    }, [router])

    // H-14: cancel pending tab-switch timer before starting a new one
    const handleTabChange = useCallback((tab: TabId) => {
        if (tab === activeTab) return
        clearTimeout(tabTimerRef.current)
        setTabVisible(false)
        tabTimerRef.current = setTimeout(() => {
            setActiveTab(tab)
            setTabVisible(true)
            trackEvent('tab_viewed', { tab })
        }, 100)
    }, [activeTab])

    const handleNotifChange = useCallback(async (enabled: boolean, time: string) => {
        // C-08: guard against environments where Notification API is absent
        if (enabled && !notifSupported) {
            setNotifError('Push notifications are not supported on this device.')
            setTimeout(() => setNotifError(''), 3000)
            return
        }
        if (enabled) {
            if (Notification.permission === 'denied') {
                setNotifError('Notifications are blocked. Please allow them in your browser settings and try again.')
                setTimeout(() => setNotifError(''), 3000)
                return
            }
            if (Notification.permission === 'default') {
                const perm = await Notification.requestPermission()
                if (perm !== 'granted') {
                    setNotifEnabled(false)
                    localStorage.setItem('shastra-notif-enabled', 'false')
                    return
                }
            }
        }
        setNotifEnabled(enabled)
        setNotifTime(time)
        localStorage.setItem('shastra-notif-enabled', String(enabled))
        localStorage.setItem('shastra-notif-time', time)
        scheduleNotification(enabled, time)
    }, [notifSupported])

    const handleDarkModeToggle = useCallback(() => {
        const next = !darkMode
        setDarkMode(next)
        trackEvent('dark_mode_toggled', { enabled: next })
        localStorage.setItem('shastra-dark', String(next))
        if (next) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    // Memoize expensive astronomy calculations — must be before any early return (Rules of Hooks)
    const todayData = useMemo(() => {
        try { return getMockVedicDay(lat, lng) } catch { return getMockVedicDay() }
    }, [lat, lng])
    const ekadashi = useMemo(() => {
        try { return getNextEkadashi(lat, lng) } catch { return getNextEkadashi() }
    }, [lat, lng])

    const bgStyle = { backgroundColor: 'var(--bg-base)' }

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
                <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(232,89,26,0.15)', borderTopColor: '#E8591A' }} />
            </div>
        )
    }

    return (
        <main className="min-h-screen relative" style={bgStyle}>
            {/* First-time welcome screen */}
            {showWelcome && (
                <div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8 text-center"
                    style={{
                        background: 'linear-gradient(160deg, #FAF0E6 0%, #FFF3E8 50%, #FAF7F2 100%)',
                        animation: 'fadeIn 0.6s ease',
                    }}
                    onClick={() => setShowWelcome(false)}
                >
                    <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }`}</style>
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                        style={{ background: 'rgba(232,89,26,0.12)', border: '2px solid rgba(232,89,26,0.25)' }}
                    >
                        <span className="text-4xl" style={{ color: '#E8591A', lineHeight: 1 }}>ॐ</span>
                    </div>
                    <h1
                        className="text-3xl font-light text-slate-800 mb-2"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.04em' }}
                    >
                        {userName ? `Namaste, ${userName}` : `Welcome, devotee of ${welcomeDeity}`}
                    </h1>
                    <p className="text-sm text-slate-500 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Your daily Panchang is ready
                    </p>
                    <p className="text-xs text-slate-400 mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Tap anywhere to continue
                    </p>
                    <div className="mt-8 flex items-center gap-2 opacity-50">
                        <span style={{ color: '#E8591A', fontSize: '18px' }}>ॐ</span>
                        <span className="text-xs tracking-widest uppercase text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>Shastra Life</span>
                        <span style={{ color: '#E8591A', fontSize: '18px' }}>ॐ</span>
                    </div>
                </div>
            )}

            {/* Ambient gradient orbs — absolute (not fixed) to avoid full-viewport repaint on every scroll frame */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(232,89,26,0.06) 0%, transparent 70%)' }} />
                <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)' }} />
                <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(232,89,26,0.04) 0%, transparent 70%)' }} />
            </div>

            <div className="relative" style={{ zIndex: 1 }}>
                <Header />

                {/* Tab content with fade transition */}
                <div
                    className="max-w-lg mx-auto px-4 pt-5 space-y-5 tab-content"
                    role="region"
                    aria-live="polite"
                    aria-label={t(`nav.${activeTab}`)}
                    style={{
                        opacity: tabVisible ? 1 : 0,
                        transition: 'opacity 0.1s ease-out',
                        paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 16px))',
                    }}
                >
                    {/* ── TODAY ── */}
                    {activeTab === 'today' && (
                        <div className="flex flex-col gap-4">
                            <CardErrorBoundary label="Today's energy">
                                <TodayEnergyCard data={todayData} />
                            </CardErrorBoundary>
                            {/* Deity personalisation card */}
                            {userDeity && (
                                <div
                                    className="rounded-2xl px-5 py-4"
                                    style={{
                                        background: darkMode
                                            ? 'rgba(232,89,26,0.08)'
                                            : 'linear-gradient(135deg, rgba(232,89,26,0.06) 0%, rgba(212,175,55,0.06) 100%)',
                                        border: `1px solid ${darkMode ? 'rgba(232,89,26,0.15)' : 'rgba(232,89,26,0.1)'}`,
                                    }}
                                >
                                    <p className="text-xs font-bold tracking-widest uppercase mb-2"
                                        style={{ color: '#E8591A', fontFamily: "'Inter', sans-serif" }}>
                                        {t('dashboard.practice')}
                                    </p>
                                    <p className="text-base font-light"
                                        style={{
                                            color: darkMode ? '#E2D9C8' : '#4A5568',
                                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                                            fontSize: '17px', lineHeight: 1.5,
                                        }}>
                                        {getDeityMessage(userDeity)}
                                    </p>
                                </div>
                            )}
                            <CardErrorBoundary label="Muhurta">
                                <MuhurtaCard vara={todayData.vara} tithiNumber={todayData.tithi.number} sunrise={todayData.sunrise} />
                            </CardErrorBoundary>
                            <CardErrorBoundary label="Ekadashi">
                                <EkadashiCard data={ekadashi} />
                            </CardErrorBoundary>
                            <CardErrorBoundary label="Horoscope">
                                <HoroscopeSection />
                            </CardErrorBoundary>
                            <SanskritFooter tab="today" />
                        </div>
                    )}

                    {/* ── CALENDAR ── */}
                    {activeTab === 'calendar' && (
                        <>
                            <CardErrorBoundary label="Calendar">
                                <CalendarView />
                            </CardErrorBoundary>
                            <div className="mt-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.12em' }}>
                                    {t('festival.upcoming')}
                                </p>
                                <CardErrorBoundary label="Festival calendar">
                                    <FestivalCalendar />
                                </CardErrorBoundary>
                            </div>
                            <SanskritFooter tab="calendar" />
                        </>
                    )}

                    {/* ── ORACLE ── */}
                    {activeTab === 'oracle' && (
                        <>
                            <DailyOracle />
                            <div className="mt-4">
                                <DailyOracle showFavourites />
                            </div>
                            <SanskritFooter tab="oracle" />
                        </>
                    )}

                    {/* ── SETTINGS ── */}
                    {activeTab === 'settings' && (
                        <>
                            <SettingsPage
                                notifTime={notifTime}
                                notifEnabled={notifEnabled}
                                onNotifChange={handleNotifChange}
                                darkMode={darkMode}
                                onDarkModeToggle={handleDarkModeToggle}
                            />
                            <SanskritFooter tab="settings" />
                        </>
                    )}
                </div>

            </div>

            {notifError && (
                <div
                    className="fixed top-4 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm text-center"
                    style={{ background: 'rgba(239,68,68,0.95)', color: 'white', fontFamily: "'Inter', sans-serif" }}
                    role="alert"
                >
                    {notifError}
                </div>
            )}

            <BottomNav active={activeTab} onChange={handleTabChange} />
        </main>
    )
}
