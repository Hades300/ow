import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['styled-jsx/babel']
      },
      jsxRuntime: 'classic'
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'recharts', 'dayjs'],
          ui: ['styled-jsx']
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  // 确保路径解析正确
  publicDir: 'public',
  base: '/'
}) 