import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Taskly-v0.2/',
  server: {
    port: 5500,
    host: true
  },
  build: {
    outDir: 'docs'
  }
})
