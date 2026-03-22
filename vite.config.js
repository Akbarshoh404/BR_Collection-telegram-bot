import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(async ({ command }) => {
  const plugins = [react()]

  if (command === 'build' && process.platform !== 'win32') {
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
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return
            }

            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor'
            }

            if (id.includes('framer-motion')) {
              return 'animations'
            }

            if (id.includes('lucide-react')) {
              return 'icons'
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
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
