'use client'

import { useLanguage } from '@/components/LanguageContext'

export default function OfflinePage() {
    const { t } = useLanguage()
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
            style={{ background: 'linear-gradient(160deg, #FAF7F2 0%, #FFF3E8 100%)' }}
        >
            {/* Om symbol */}
            <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'rgba(232,89,26,0.1)', border: '1px solid rgba(232,89,26,0.2)' }}
            >
                <span className="text-4xl" style={{ color: '#E8591A', lineHeight: 1 }}>ॐ</span>
            </div>

            <h1
                className="text-3xl font-light text-slate-800 mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.04em' }}
            >
                Shastra Life
            </h1>

            <p
                className="text-sm font-medium text-slate-500 mb-8 uppercase tracking-widest"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                {t('offline.status')}
            </p>

            <div
                className="rounded-2xl px-6 py-5 max-w-xs w-full mb-8"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(232,89,26,0.15)' }}
            >
                <p
                    className="text-base italic text-slate-600 leading-relaxed mb-3"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '18px' }}
                >
                    "In this world there is no greater purifier than knowledge."
                </p>
                <p
                    className="text-xs text-slate-400"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    Bhagavad Gita, Chapter 4 · Verse 38
                </p>
            </div>

            <p
                className="text-sm text-slate-400 leading-relaxed max-w-xs"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                {t('offline.message')}
            </p>

            <button
                onClick={() => window.location.reload()}
                className="mt-8 px-8 py-3 rounded-xl text-sm font-medium text-white transition-all active:scale-95"
                style={{ fontFamily: "'Inter', sans-serif", background: '#E8591A' }}
            >
                {t('offline.retry')}
            </button>
        </div>
    )
}
