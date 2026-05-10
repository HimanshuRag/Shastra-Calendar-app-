/** @type {import('tailwindcss').Config} */
module.exports = {
    // Use 'class' strategy so the .dark class on <html> drives dark: utilities
    // (NOT the OS prefers-color-scheme media query)
    darkMode: 'class',
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                cream: '#FAF7F2',
                'cream-dark': '#F0EBE1',
                saffron: '#E8591A',
                'saffron-light': '#F47B40',
                'saffron-glow': 'rgba(232, 89, 26, 0.15)',
                'saffron-muted': 'rgba(232, 89, 26, 0.08)',
                slate: '#4A5568',
                'slate-light': '#718096',
                'slate-dark': '#2D3748',
                gold: '#D4AF37',
                'gold-light': '#F0D060',
            },
            fontFamily: {
                serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
            },
            keyframes: {
                'spin-slow': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '0.8', filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))' },
                    '50%': { opacity: '1', filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.9))' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-6px)' },
                },
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
                'bounce-in': {
                    '0%': { transform: 'scale(0.85)', opacity: '0' },
                    '60%': { transform: 'scale(1.05)', opacity: '1' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
            animation: {
                'spin-slow': 'spin-slow 20s linear infinite',
                'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
                'float': 'float 4s ease-in-out infinite',
                'fade-up': 'fade-up 0.6s ease-out forwards',
                'shimmer': 'shimmer 3s linear infinite',
                'bounce-in': 'bounce-in 0.35s ease-out forwards',
                'scale-in': 'scale-in 0.25s ease-out forwards',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
