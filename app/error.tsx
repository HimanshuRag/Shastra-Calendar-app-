'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log to console so we can see the real error in dev tools
        if (process.env.NODE_ENV !== 'production') {
            console.error('[Shastra Error Boundary]', error)
        } else {
            console.error('[Shastra] An error occurred:', error.digest ?? 'unknown')
        }
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
            style={{ background: '#FAF7F2' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(232,89,26,0.1)', border: '1px solid rgba(232,89,26,0.2)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8591A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-2 4-6 6-6 10a6 6 0 0 0 12 0c0-4-4-6-6-10z"/><path d="M12 12v6"/></svg>
            </div>
            <h2 className="text-2xl font-light text-slate-800 mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Something went wrong
            </h2>
            <p className="text-sm text-slate-400 mb-6 max-w-xs leading-relaxed"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                An unexpected error occurred. Please try again, or restart the app if the problem persists.
            </p>
            <button
                onClick={reset}
                className="px-8 py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #E8591A, #F47B40)', fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 20px rgba(232,89,26,0.3)' }}>
                Try Again
            </button>
        </div>
    )
}
