import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'OP Tracker',
        short_name: 'OP Tracker',
        description: 'Logbook Perjalanan Anime',
        theme_color: '#dc2626',
        background_color: '#fafafa',
        display: 'standalone',
        icons: [
          {
            src: 'mugiwara-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'mugiwara-logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3002,
    strictPort: true,
  },
})
