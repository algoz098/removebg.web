import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    open: true,
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sobre: resolve(__dirname, 'sobre.html')
      },
      output: {
        manualChunks: {
          vendor: ['@imgly/background-removal']
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  assetsInclude: ['**/*.wasm']
})
