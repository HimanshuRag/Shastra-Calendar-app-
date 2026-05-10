/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: { ignoreDuringBuilds: true },
    // Required for Capacitor/TWA static export
    output: 'export',
    trailingSlash: true,
    // next/image optimisation requires a server; disable for static builds
    images: {
        unoptimized: true,
    },
}

module.exports = nextConfig
