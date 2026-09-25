import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'SyncPlay — Mira YouTube juntos',
        short_name: 'SyncPlay',
        description: 'Mira videos de YouTube sincronizados con quien quieras, desde cualquier dispositivo.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#08090a',
        theme_color: '#08090a',
        categories: ['social', 'entertainment'],
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/ws': { target: 'http://localhost:3001', ws: true },
      '/api': { target: 'http://localhost:3001' },
    },
  },
});
