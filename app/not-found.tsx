export default function NotFound() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
            style={{ background: 'linear-gradient(160deg, #FAF7F2 0%, #FFF3E8 100%)' }}
        >
            <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'rgba(232,89,26,0.1)', border: '1px solid rgba(232,89,26,0.2)' }}
            >
                <span className="text-4xl" style={{ color: '#E8591A', lineHeight: 1 }}>ॐ</span>
            </div>

            <h1
                className="text-4xl font-light text-slate-800 mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.04em' }}
            >
                Page Not Found
            </h1>

            <p className="text-sm text-slate-500 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                "न जायते म्रियते वा कदाचित्"
            </p>
            <p className="text-xs text-slate-400 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
                This path does not exist — but your journey continues.
            </p>

            <a
                href="/dashboard/"
                className="px-8 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95 inline-block"
                style={{
                    background: 'linear-gradient(135deg, #E8591A, #F47B40)',
                    boxShadow: '0 8px 24px rgba(232,89,26,0.3)',
                    fontFamily: "'Inter', sans-serif",
                    textDecoration: 'none',
                }}
            >
                Return Home ✦
            </a>
        </div>
    )
}
