import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(async ({ command }) => {
  const plugins = [react()]

  if (command === 'build') {
    try {
      const { default: compression } = await import('vite-plugin-compression')

      plugins.push(
        compression({
          verbose: true,
          disable: false,
          threshold: 10240,
          algorithm: 'brotli',
          ext: '.br',
        }),
        compression({
          verbose: true,
          disable: false,
          threshold: 10240,
          algorithm: 'gzip',
          ext: '.gz',
        }),
      )
    } catch {
      console.warn('vite-plugin-compression is not installed, skipping asset compression.')
    }
  }

  return {
    plugins,
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'animations': ['framer-motion'],
            'icons': ['lucide-react'],
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Enable source maps for production debugging
      sourcemap: false,
    },
    server: {
      port: 5173,
      strictPort: false,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'],
    },
  }
})
