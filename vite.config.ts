import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/gpx-route-creator/' : '/',
  server: {
    port: 3000,
    host: true,
    strictPort: true
  }
})