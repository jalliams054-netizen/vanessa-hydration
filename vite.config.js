import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const BASE = '/vanessa-hydration/'
const shortcutIcon = (size) => [{ src: `${BASE}icons/icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png' }]

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      filename: 'sw.js',
      srcDir: 'src',
      strategies: 'injectManifest',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: BASE,
        name: "Vanessa's Hydration",
        short_name: 'Hydration',
        description: "Vanessa's water garden — sip, grow, keep the streak alive.",
        lang: 'en',
        dir: 'ltr',
        theme_color: '#8FD3F4',
        background_color: '#12142E',
        display: 'standalone',
        orientation: 'portrait',
        start_url: `${BASE}?source=pwa`,
        scope: BASE,
        categories: ['health', 'lifestyle', 'productivity'],
        icons: [
          { src: `${BASE}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${BASE}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: `${BASE}icons/maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Log a glass (250 ml)',
            short_name: '250 ml',
            description: 'One glass, straight into the garden.',
            url: `${BASE}?action=log&ml=250`,
            icons: shortcutIcon(192),
          },
          {
            name: 'Log a big gulp (500 ml)',
            short_name: '500 ml',
            description: 'For when the plant deserves it.',
            url: `${BASE}?action=log&ml=500`,
            icons: shortcutIcon(192),
          },
          {
            name: 'Quick sip (150 ml)',
            short_name: 'Sip',
            description: 'Small but counts, scientifically.',
            url: `${BASE}?action=log&ml=150`,
            icons: shortcutIcon(192),
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
})
