'use client'

import { useLanguage } from '@/components/LanguageContext'

type FooterTab = 'today' | 'calendar' | 'oracle' | 'settings'

const SHLOKAS: Record<FooterTab, { sanskrit: string; transliteration: string; en: string; hi: string; source: string }> = {
    today: {
        sanskrit: 'आरोग्यं परमं भाग्यम्',
        transliteration: 'Ārogyaṃ paramaṃ bhāgyam',
        en: 'Health is the greatest fortune',
        hi: 'स्वास्थ्य ही सबसे बड़ा भाग्य है',
        source: 'Chanakya Niti',
    },
    calendar: {
        sanskrit: 'कालो जगत्यस्य नियन्ता',
        transliteration: 'Kālo jagatyasya niyantā',
        en: 'Time is the ruler of the world',
        hi: 'काल ही जगत का नियंता है',
        source: 'Mahabharata',
    },
    oracle: {
        sanskrit: 'यद्भावं तद्भवति',
        transliteration: 'Yadbhāvaṃ tadbhavati',
        en: 'As you think, so you become',
        hi: 'जैसी भावना, वैसा ही होता है',
        source: 'Bhagavad Gita',
    },
    settings: {
        sanskrit: 'सर्वे भवन्तु सुखिनः',
        transliteration: 'Sarve bhavantu sukhinaḥ',
        en: 'May all beings be happy',
        hi: 'सभी प्राणी सुखी हों',
        source: 'Brihadaranyaka Upanishad',
    },
}

export default function SanskritFooter({ tab }: { tab: FooterTab }) {
    const { language } = useLanguage()
    const s = SHLOKAS[tab] ?? SHLOKAS['today']

    return (
        <div className="mt-6 mb-2 flex flex-col items-center gap-3 select-none">
            {/* Gradient divider */}
            <div
                className="w-full h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(232,89,26,0.2), rgba(212,175,55,0.25), rgba(232,89,26,0.2), transparent)' }}
            />

            {/* Decorative Om + dots */}
            <div aria-hidden="true" className="flex items-center gap-2 opacity-40">
                <span className="text-xs" style={{ color: '#E8591A' }}>✦</span>
                <span className="text-base" style={{ color: '#E8591A', fontFamily: "'Cormorant Garamond', serif" }}>ॐ</span>
                <span className="text-xs" style={{ color: '#E8591A' }}>✦</span>
            </div>

            {/* Sanskrit shloka */}
            <blockquote aria-label="Sanskrit wisdom" className="text-center">
                <p
                    className="text-center italic leading-snug"
                    style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: '17px',
                        color: 'var(--text-secondary, #64748B)',
                        letterSpacing: '0.01em',
                    }}
                >
                    "{s.sanskrit}"
                </p>

                {/* Translation */}
                <p
                    className="text-center"
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        color: 'var(--text-muted, #94A3B8)',
                        letterSpacing: '0.02em',
                    }}
                >
                    {language === 'hi' ? s.hi : s.en}
                </p>

                <footer className="mt-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#94A3B8' }}>
                    — {s.source}
                </footer>
            </blockquote>

            {/* Bottom dots */}
            <div aria-hidden="true" className="flex items-center gap-1.5 opacity-30">
                <div className="w-1 h-1 rounded-full" style={{ background: '#E8591A' }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#D4AF37' }} />
                <div className="w-1 h-1 rounded-full" style={{ background: '#E8591A' }} />
            </div>
        </div>
    )
}
