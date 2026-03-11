import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Load .env from the root directory
  envDir: '../',
  // Expose GOOGLE_MAPS_API_KEY to import.meta.env
  envPrefix: ['VITE_', 'GOOGLE_MAPS_API_KEY'],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
