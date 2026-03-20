import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true
    })
  ],
  server: {
    watch: {
      usePolling: true,
      interval: 100
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  }
})
