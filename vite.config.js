import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Taskly-v0.2/',
    server: {
      port:5500,
      host: true,
    }


})
