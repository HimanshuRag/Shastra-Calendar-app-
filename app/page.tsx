'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Root route — redirect to /dashboard if already onboarded, else /onboarding.
 * This ensures new users always go through onboarding and returning users land
 * on the main app. The actual content lives in /dashboard.
 */
export default function Home() {
    const router = useRouter()

    useEffect(() => {
        try {
            const onboarded = localStorage.getItem('shastra-onboarded')
            if (onboarded === 'true') router.replace('/dashboard/')
            else router.replace('/onboarding/')
        } catch {
            router.replace('/onboarding/')
        }
    }, [router])

    // Show nothing while redirecting — avoids flash of wrong content
    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ backgroundColor: '#FAF7F2' }}
        >
            <div
                className="w-10 h-10 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(232,89,26,0.15)', borderTopColor: '#E8591A' }}
            />
        </div>
    )
}
