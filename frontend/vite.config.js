import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true, // Allow localtunnel hosts
    host: true, // Listen on all local IPs
    hmr: {
      clientPort: 5173,
    },
  },
  resolve: {
    alias: {
      // Force all packages to use the same React instance
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom', 'three'],
  },
})
