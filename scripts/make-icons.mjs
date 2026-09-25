// Generates the PWA icons from the broadcast logo (requires `sharp`, dev-only).
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const outDir = path.resolve('public/icons');
await mkdir(outDir, { recursive: true });

const POOL = `<defs><radialGradient id="pool" cx="0.3" cy="0.2" r="1">
<stop offset="0" stop-color="#1c2438"/><stop offset="1" stop-color="#080b11"/>
</radialGradient></defs>`;

const GLYPH = `<g><path d="M150 172 L150 340 L296 256 Z" fill="#f5b84a"/>
<g fill="none" stroke="#e5484d" stroke-width="22" stroke-linecap="round">
<path d="M330 178 a110 110 0 0 1 0 156"/>
<path d="M382 138 a170 170 0 0 1 0 236" opacity="0.55"/>
</g>
<circle cx="150" cy="132" r="17" fill="#e5484d"/></g>`;

// Rounded app-tile icon (transparent corners).
const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
${POOL}
<rect width="512" height="512" rx="110" fill="url(#pool)"/>
${GLYPH}
</svg>`;

// Full-bleed variants for maskable and apple-touch-icon (no transparency).
const fullBleed = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
${POOL}
<rect width="512" height="512" fill="url(#pool)"/>
<g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${GLYPH.replace('<g>', '').replace(/<\/g>$/,'')}</g>
</svg>`;

await sharp(Buffer.from(tile)).resize(512, 512).png().toFile(path.join(outDir, 'pwa-512.png'));
await sharp(Buffer.from(tile)).resize(192, 192).png().toFile(path.join(outDir, 'pwa-192.png'));
await sharp(Buffer.from(fullBleed(0.62))).resize(512, 512).png().toFile(path.join(outDir, 'maskable-512.png'));
await sharp(Buffer.from(fullBleed(0.72))).resize(180, 180).png().toFile(path.join(outDir, 'apple-touch-icon.png'));

console.log('Icons generated in public/icons/');
