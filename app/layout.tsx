import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { LanguageProvider } from '@/components/LanguageContext'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import LangSync from '@/components/LangSync'
import CloudProvider from '@/components/CloudProvider'

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    style: ['normal', 'italic'],
    variable: '--font-cormorant',
    display: 'swap',
})

const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
    variable: '--font-inter',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Shastra Life — Minimal Hindu Calendar & Daily Oracle',
    description: 'Your daily Vedic companion. Discover today\'s Tithi, Ekadashi fasting windows, and the Daily Oracle — a Sanskrit wisdom card for your day.',
    keywords: ['Hindu calendar', 'Tithi', 'Ekadashi', 'Vedic calendar', 'Daily oracle', 'Bhagavad Gita'],
    manifest: '/manifest.json',
    openGraph: {
        title: 'Shastra Life — Minimal Hindu Calendar & Daily Oracle',
        description: 'Your daily Vedic companion. Panchang, Ekadashi fasting, and a Sanskrit wisdom card — every day.',
        url: 'https://shastralife.app',
        siteName: 'Shastra Life',
        images: [
            {
                url: 'https://shastralife.app/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Shastra Life — Daily Vedic Companion',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Shastra Life — Minimal Hindu Calendar & Daily Oracle',
        description: 'Your daily Vedic companion. Panchang, Ekadashi fasting, and a Sanskrit wisdom card — every day.',
        images: ['https://shastralife.app/og-image.png'],
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: '#E8591A',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
            {/* LangSync updates document.documentElement.lang at runtime for the user's chosen language */}
            <head>
                {/* CSP only in production — dev mode needs unsafe-eval for react-refresh hot reload.
                    frame-ancestors is intentionally omitted from <meta> (browsers ignore it there anyway). */}
                {process.env.NODE_ENV === 'production' && (
                    <meta
                        httpEquiv="Content-Security-Policy"
                        content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://nominatim.openstreetmap.org https://*.googleapis.com https://*.posthog.com https://*.supabase.co; base-uri 'self';"
                    />
                )}
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="Shastra Life" />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
            </head>
            <body>
                <CloudProvider>
                    <LanguageProvider>
                        <LangSync />
                        <ServiceWorkerRegistration />
                        {children}
                    </LanguageProvider>
                </CloudProvider>
            </body>
        </html>
    )
}
