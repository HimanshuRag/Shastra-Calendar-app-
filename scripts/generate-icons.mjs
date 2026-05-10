/**
 * Generate PWA icon PNGs from the icon SVG.
 * Run: node scripts/generate-icons.mjs
 * Requires: npm install --save-dev sharp
 */
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svgPath = resolve(root, 'public/icons/icon.svg')
const svg = readFileSync(svgPath)

const sizes = [192, 512]

for (const size of sizes) {
    await sharp(svg)
        .resize(size, size)
        .png()
        .toFile(resolve(root, `public/icons/icon-${size}.png`))
    console.log(`✓ Generated icon-${size}.png`)
}
console.log('Done! PWA icons are ready.')
