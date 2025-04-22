import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    RubyPlugin(),
    react(),
    tailwindcss()
  ],
  build: {
    manifest: true,
    outDir: 'public/vite',
    rollupOptions: {
      input: 'app/frontend/entrypoints/application.tsx'
    }
  }
})
