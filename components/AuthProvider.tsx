'use client'

import { ReactNode } from 'react'

// For static export / Capacitor mobile build:
// NextAuth SessionProvider requires a server-side API route which doesn't exist
// in static builds. We use a pass-through wrapper here.
// For web deployment with Vercel, restore the full NextAuth SessionProvider.
export default function AuthProvider({ children }: { children: ReactNode }) {
    return <>{children}</>
}
