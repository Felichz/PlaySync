// Generates the PWA icons from the logo (requires `sharp`, dev-only).
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const outDir = path.resolve('public/icons');
await mkdir(outDir, { recursive: true });

const TILE = `<defs><linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#20222a"/><stop offset="1" stop-color="#14151a"/>
</linearGradient></defs>`;

const GLYPH = `<path d="M196 168 L196 344 L340 256 Z" fill="#7b83eb"/>
<g fill="none" stroke="#9aa0a6" stroke-width="18" stroke-linecap="round">
<path d="M372 196 a86 86 0 0 1 0 120" opacity="0.7"/>
<path d="M412 158 a140 140 0 0 1 0 196" opacity="0.35"/>
</g>`;

// Rounded app-tile icon (transparent corners).
const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
${TILE}
<rect width="512" height="512" rx="112" fill="url(#tile)" stroke="#3a3d46" stroke-width="6"/>
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
