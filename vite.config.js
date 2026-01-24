import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ filename: './docs/stats.html', open: false })
  ],
  base: '/Taskly-v0.2/',
  server: {
    port: 5500,
    host: true
  },
  build: {
    outDir: 'docs',
    // raise warning limit to reduce false positives during dev
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor_firebase'
            if (id.includes('react')) return 'vendor_react'
            if (id.includes('react-router-dom')) return 'vendor_router'
            return 'vendor'
          }
        }
      }
    }
  },
  define: {
    'process.env': {}
  }
})
