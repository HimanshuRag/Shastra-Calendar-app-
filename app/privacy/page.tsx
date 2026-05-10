import BackButton from '@/components/BackButton'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl px-5 py-5 space-y-2" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)' }}>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.12em', color: '#E8591A' }}>
            {title}
        </h2>
        {children}
    </div>
)

const Body = ({ children }: { children: React.ReactNode }) => (
    <p className="text-sm leading-relaxed text-slate-600" style={{ fontFamily: "'Inter', sans-serif" }}>
        {children}
    </p>
)

const Bullet = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-start gap-2">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#E8591A' }} />
        <p className="text-sm leading-relaxed text-slate-600" style={{ fontFamily: "'Inter', sans-serif" }}>{children}</p>
    </div>
)

export default function PrivacyPage() {
    return (
        <div
            className="min-h-screen"
            style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF3E8 40%, #FFF0E0 100%)' }}
        >
            {/* Header */}
            <div className="sticky top-0 z-10 px-4 pt-safe-top" style={{ background: 'rgba(255,248,240,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(232,89,26,0.1)' }}>
                <div className="max-w-lg mx-auto flex items-center gap-3 py-4">
                    <BackButton />
                    <div>
                        <h1 className="text-lg font-semibold text-slate-800" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.01em' }}>
                            Privacy Policy
                        </h1>
                        <p className="text-xs text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>Shastra Life</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-16 pt-5 max-w-lg mx-auto space-y-4">

                <p className="text-xs text-slate-400 px-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Effective date: April 2026 &nbsp;·&nbsp; Last updated: April 2026
                </p>

                {/* ── Overview ── */}
                <Section title="Overview">
                    <Body>
                        Shastra Life is a personal Vedic calendar and daily oracle app. We are committed to protecting your privacy. This policy explains exactly what data we collect, why we collect it, and how it is used.
                    </Body>
                    <Body>
                        We collect minimal, anonymous usage data to understand how the app is used and to improve it. We do not collect your name, email address, or any information that personally identifies you.
                    </Body>
                </Section>

                {/* ── Data We Collect ── */}
                <Section title="Data We Collect">
                    <Body>We collect the following types of data:</Body>
                    <div className="space-y-2 mt-1">
                        <Bullet>
                            <strong>Usage analytics</strong> — which tabs you visit, which features you use (e.g. Oracle reveal, horoscope sign changes, language preference). This data is anonymous and contains no personal identifiers.
                        </Bullet>
                        <Bullet>
                            <strong>Device information</strong> — device model, operating system version, and app version, used for crash analysis and compatibility.
                        </Bullet>
                        <Bullet>
                            <strong>Approximate location</strong> — your GPS coordinates are used on-device to calculate accurate Panchang timings (Sunrise, Sunset, Tithi). Coordinates are also briefly sent to OpenStreetMap&apos;s Nominatim service to determine your city name. No coordinates are stored by us.
                        </Bullet>
                        <Bullet>
                            <strong>App preferences</strong> — your chosen deity, zodiac sign, language, and display settings are stored locally on your device only (via localStorage). They are never transmitted to our servers.
                        </Bullet>
                    </div>
                </Section>

                {/* ── Data We Do NOT Collect ── */}
                <Section title="Data We Do NOT Collect">
                    <div className="space-y-2">
                        <Bullet>Your name, email address, phone number, or any contact information</Bullet>
                        <Bullet>Account credentials — there is no sign-in or registration</Bullet>
                        <Bullet>Payment information of any kind</Bullet>
                        <Bullet>Your precise location history</Bullet>
                        <Bullet>Your contacts, camera, microphone, or files</Bullet>
                        <Bullet>Any information from children — the app does not target or knowingly collect data from users under 13</Bullet>
                    </div>
                </Section>

                {/* ── How We Use Data ── */}
                <Section title="How We Use Your Data">
                    <div className="space-y-2">
                        <Bullet><strong>To provide accurate Panchang calculations</strong> — your location determines Sunrise/Sunset and Tithi timing for your timezone.</Bullet>
                        <Bullet><strong>To improve the app</strong> — anonymous analytics help us understand which features are most used so we can prioritise improvements.</Bullet>
                        <Bullet><strong>To fix crashes</strong> — device and OS information helps us identify and resolve technical issues.</Bullet>
                        <Bullet><strong>To personalise your experience</strong> — your locally-stored preferences (deity, zodiac, language) customise the content shown to you.</Bullet>
                    </div>
                </Section>

                {/* ── Analytics & Third-Party Services ── */}
                <Section title="Analytics & Third-Party Services">
                    <Body>
                        Shastra Life uses <strong>PostHog Analytics</strong> to collect anonymous, aggregated usage data. PostHog is an open-source product analytics platform. Data collected by PostHog is governed by PostHog&apos;s Privacy Policy at{' '}
                        <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#E8591A', textDecoration: 'underline', textDecorationColor: 'rgba(232,89,26,0.4)' }}>
                            posthog.com/privacy
                        </a>.
                    </Body>
                    <Body>
                        For city-name lookup, the app uses <strong>OpenStreetMap Nominatim</strong> — a free, open-source geocoding service. Your coordinates are sent to Nominatim only when you open the app and grant location permission. Nominatim&apos;s privacy policy is available at{' '}
                        <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" style={{ color: '#E8591A', textDecoration: 'underline', textDecorationColor: 'rgba(232,89,26,0.4)' }}>
                            osmfoundation.org
                        </a>.
                    </Body>
                    <Body>
                        We do not use advertising networks, data brokers, social media trackers, or behavioural profiling tools of any kind.
                    </Body>
                </Section>

                {/* ── Data Storage & Retention ── */}
                <Section title="Data Storage & Retention">
                    <Body>
                        Your app preferences are stored exclusively on your device using browser localStorage. Clearing the app&apos;s data or uninstalling the app permanently deletes these preferences.
                    </Body>
                    <Body>
                        Anonymous analytics data is retained by PostHog for up to 12 months, after which it is automatically deleted, per PostHog&apos;s default retention policy.
                    </Body>
                </Section>

                {/* ── Internet & Permissions ── */}
                <Section title="Permissions We Request">
                    <div className="space-y-2">
                        <Bullet><strong>INTERNET</strong> — Required to load the app, send anonymous analytics, perform city lookup, and deliver push notifications.</Bullet>
                        <Bullet><strong>ACCESS_FINE_LOCATION / ACCESS_COARSE_LOCATION</strong> — Used only to improve Panchang calculation accuracy. You may deny this; the app uses a default location as fallback.</Bullet>
                        <Bullet><strong>POST_NOTIFICATIONS</strong> — Required (Android 13+) to deliver your optional daily Panchang reminder. You can disable this in Settings at any time.</Bullet>
                    </div>
                </Section>

                {/* ── Your Rights ── */}
                <Section title="Your Rights">
                    <Body>You have full control over your data:</Body>
                    <div className="space-y-2 mt-1">
                        <Bullet><strong>Delete all local data</strong> — Use Settings → Reset & Redo Onboarding, or uninstall the app.</Bullet>
                        <Bullet><strong>Opt out of analytics</strong> — Contact us at privacy@shastralife.app to request deletion of any analytics data associated with your device.</Bullet>
                        <Bullet><strong>Deny location</strong> — The app functions fully without location permission, using a default city for Panchang calculations.</Bullet>
                        <Bullet><strong>Disable notifications</strong> — Toggle off in Settings → Morning Reminder at any time.</Bullet>
                    </div>
                </Section>

                {/* ── Third-Party Sharing ── */}
                <Section title="Third-Party Sharing">
                    <Body>
                        We do not sell, rent, trade, or share any user data with third parties for commercial purposes. The only data sharing that occurs is:
                    </Body>
                    <div className="space-y-2 mt-1">
                        <Bullet>Anonymous analytics sent to PostHog as described above.</Bullet>
                        <Bullet>Your GPS coordinates sent to Nominatim (OpenStreetMap) for city-name lookup, solely when you grant location permission.</Bullet>
                    </div>
                </Section>

                {/* ── Changes ── */}
                <Section title="Changes to This Policy">
                    <Body>
                        If we materially change this policy, we will update the effective date above and notify users via an in-app banner. Continued use of the app after a change constitutes acceptance of the updated policy.
                    </Body>
                </Section>

                {/* ── Contact ── */}
                <Section title="Contact">
                    <Body>
                        Questions or concerns about your privacy? We&apos;re happy to help. Reach us at{' '}
                        <a href="mailto:privacy@shastralife.app" style={{ color: '#E8591A', textDecoration: 'underline', textDecorationColor: 'rgba(232,89,26,0.4)' }}>
                            privacy@shastralife.app
                        </a>
                    </Body>
                </Section>

                <p className="text-xs text-center text-slate-400 italic pt-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px' }}>
                    "सत्यमेव जयते" — Truth alone triumphs.
                </p>

            </div>
        </div>
    )
}
