// Generates the PWA icons from the logo (requires `sharp`, dev-only).
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const outDir = path.resolve('public/icons');
await mkdir(outDir, { recursive: true });

const GRAD = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#7c3aed"/><stop offset="0.55" stop-color="#d946ef"/><stop offset="1" stop-color="#22d3ee"/>
</linearGradient></defs>`;

const GLYPH = `<g fill="#fff">
<path d="M216 170 L216 342 L344 256 Z"/>
<rect x="146" y="226" width="20" height="60" rx="10"/>
<rect x="176" y="206" width="20" height="100" rx="10" opacity="0.85"/>
<rect x="356" y="216" width="20" height="80" rx="10" opacity="0.85"/>
<rect x="386" y="236" width="20" height="40" rx="10" opacity="0.7"/>
</g>`;

// Standard icon: dark background with a gradient tile.
const inset = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
${GRAD}
<rect width="512" height="512" rx="110" fill="#0a0b10"/>
<rect x="30" y="30" width="452" height="452" rx="92" fill="url(#g)"/>
${GLYPH}
</svg>`;

// Full-bleed variants for maskable and apple-touch-icon (no transparency).
const fullBleed = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
${GRAD}
<rect width="512" height="512" fill="url(#g)"/>
<g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${GLYPH.replace('<g fill="#fff">', '').replace('</g>', '')}</g>
</svg>`;

await sharp(Buffer.from(inset)).resize(512, 512).png().toFile(path.join(outDir, 'pwa-512.png'));
await sharp(Buffer.from(inset)).resize(192, 192).png().toFile(path.join(outDir, 'pwa-192.png'));
await sharp(Buffer.from(fullBleed(0.62))).resize(512, 512).png().toFile(path.join(outDir, 'maskable-512.png'));
await sharp(Buffer.from(fullBleed(0.72))).resize(180, 180).png().toFile(path.join(outDir, 'apple-touch-icon.png'));

console.log('Icons generated in public/icons/');
