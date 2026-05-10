'use client'

import { useLanguage } from '@/components/LanguageContext'
import { useDarkMode } from '@/hooks/useDarkMode'

export type TabId = 'today' | 'calendar' | 'oracle' | 'settings'

interface Tab {
    id: TabId
    labelKey: string
}

const TABS: Tab[] = [
    { id: 'today',    labelKey: 'nav.today'    },
    { id: 'calendar', labelKey: 'nav.calendar' },
    { id: 'oracle',   labelKey: 'nav.oracle'   },
    { id: 'settings', labelKey: 'nav.settings' },
]

function NavIcon({ id, active, isDark }: { id: TabId; active: boolean; isDark: boolean }) {
    const color = active ? '#E8591A' : isDark ? '#C4C9D4' : '#9CA3AF'
    const size = 22
    const sw = active ? '1.8' : '1.6'
    // Today — Sun with rays (today's cosmic energy)
    if (id === 'today') return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
    )
    // Calendar — Panchang calendar with Tithi marker
    if (id === 'calendar') return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <circle cx="12" cy="16" r="1.5" fill={color}/>
        </svg>
    )
    // Oracle — Third-eye / lotus wisdom
    if (id === 'oracle') return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 5V3M12 21v-2" opacity="0.5"/>
        </svg>
    )
    // Settings — Lotus-gear (preferences)
    return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    )
}

interface BottomNavProps {
    active: TabId
    onChange: (tab: TabId) => void
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
    const { t } = useLanguage()
    const isDark = useDarkMode()
    return (
        <nav
            aria-label="Main navigation"
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
                background: isDark ? 'rgba(18,12,4,0.94)' : 'rgba(250,247,242,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: isDark ? '1px solid rgba(232,89,26,0.18)' : '1px solid rgba(232,89,26,0.12)',
                boxShadow: isDark ? '0 -4px 24px rgba(0,0,0,0.4)' : '0 -4px 24px rgba(0,0,0,0.06)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
        >
            <div className="max-w-lg mx-auto flex items-center" style={{ height: '64px' }}>
                {TABS.map((tab) => {
                    const isActive = tab.id === active
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className="flex-1 flex flex-col items-center justify-center h-full transition-all duration-200 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset"
                            aria-label={t(tab.labelKey)}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {/* Active pill indicator */}
                            {isActive && (
                                <div
                                    className="absolute top-0 left-1/2 -translate-x-1/2"
                                    style={{
                                        width: 32,
                                        height: 3,
                                        borderRadius: '0 0 4px 4px',
                                        background: 'linear-gradient(90deg, #E8591A, #D4AF37)',
                                    }}
                                />
                            )}
                            {/* Icon */}
                            <span
                                className="transition-all duration-200"
                                style={{
                                    transform: isActive ? 'translateY(-1px)' : 'none',
                                    display: 'block',
                                    lineHeight: 1,
                                }}
                            >
                                <NavIcon id={tab.id} active={isActive} isDark={isDark} />
                            </span>
                            {/* Label */}
                            <span
                                className="mt-1 font-medium transition-all duration-200"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '11px',
                                    letterSpacing: '0.03em',
                                    color: isActive ? '#E8591A' : isDark ? '#C4C9D4' : '#9CA3AF',
                                    fontWeight: isActive ? 600 : 400,
                                }}
                            >
                                {t(tab.labelKey)}
                            </span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
