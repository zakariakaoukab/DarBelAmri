import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/DarBelAmri/', // Removed for Cloudflare Pages deployment (root domain)
})
