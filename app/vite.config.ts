import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon-32x32.png',
        'favicon-16x16.png',
        'apple-touch-icon.png',
        'brand/icon-light.jpeg',
      ],
      manifest: {
        name: 'Haritavanam — Plant · Track · Preserve',
        short_name: 'Haritavanam',
        description: 'Register, monitor and care for trees and planted fields.',
        theme_color: '#3A5A40',
        background_color: '#F5F1E8',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['lifestyle', 'productivity'],
        prefer_related_applications: false,
        icons: [
          { src: 'brand/icon-light.jpeg', sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
          { src: 'brand/icon-light.jpeg', sizes: '512x512', type: 'image/jpeg', purpose: 'any' },
          { src: 'brand/icon-light.jpeg', sizes: '512x512', type: 'image/jpeg', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,woff2}'],
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
})
