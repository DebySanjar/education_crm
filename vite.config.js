import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          charts: ['recharts'],
          pdf: ['jspdf'],
          excel: ['exceljs', 'file-saver', 'xlsx'],
          ui: ['framer-motion', 'styled-components', 'react-icons'],
        },
      },
    },
  },
})
