// Generates the PWA icons from the logo (requires `sharp`, dev-only).
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const outDir = path.resolve('public/icons');
await mkdir(outDir, { recursive: true });

const TILE = `<defs><linearGradient id="tile" x1="0" y1="0" x2="0.4" y2="1">
<stop offset="0" stop-color="#2d2032"/><stop offset="1" stop-color="#140f17"/>
</linearGradient><linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#ffc9a8"/><stop offset="1" stop-color="#ff9a76"/>
</linearGradient></defs>`;

// Two play marks, one catching up to the other: the room in sync.
const GLYPH = `<path d="M168 150 L168 318 L314 234 Z" fill="none" stroke="#ff8497" stroke-width="30" stroke-linejoin="round" opacity="0.9"/>
<path d="M214 196 L214 364 L360 280 Z" fill="url(#glow)" stroke="url(#glow)" stroke-width="30" stroke-linejoin="round"/>`;

// Rounded app-tile icon (transparent corners).
const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
${TILE}
<rect width="512" height="512" rx="120" fill="url(#tile)"/>
${GLYPH}
</svg>`;

// Full-bleed variants for maskable and apple-touch-icon (no transparency).
const fullBleed = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
${TILE}
<rect width="512" height="512" fill="url(#tile)"/>
<g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${GLYPH}</g>
</svg>`;

await sharp(Buffer.from(tile)).resize(512, 512).png().toFile(path.join(outDir, 'pwa-512.png'));
await sharp(Buffer.from(tile)).resize(192, 192).png().toFile(path.join(outDir, 'pwa-192.png'));
await sharp(Buffer.from(fullBleed(0.62))).resize(512, 512).png().toFile(path.join(outDir, 'maskable-512.png'));
await sharp(Buffer.from(fullBleed(0.72))).resize(180, 180).png().toFile(path.join(outDir, 'apple-touch-icon.png'));

console.log('Icons generated in public/icons/');
