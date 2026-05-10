'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
    const router = useRouter()
    const handleBack = () => {
        // window.history.length is unreliable in Capacitor WebView
        // Use a try/catch fallback to dashboard if back() doesn't navigate
        try {
            if (window.history.length > 1) {
                router.back()
            } else {
                router.replace('/dashboard/')
            }
        } catch {
            router.replace('/dashboard/')
        }
    }
    return (
        <button
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
            style={{ background: 'rgba(232,89,26,0.08)', color: '#E8591A' }}
            aria-label="Go back"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
        </button>
    )
}
