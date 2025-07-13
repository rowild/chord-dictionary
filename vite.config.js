import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  // Configure public directory for static assets
  publicDir: 'public',
  // Configure build output
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})