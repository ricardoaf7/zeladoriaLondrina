/**
 * Configuração otimizada do Vite para produção
 * Otimizações para bundle final e performance
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    // Compressão gzip e brotli para assets
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false
    }),
    // Analisador de bundle (descomentar para análise)
    // visualizer({
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true
    // })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // Otimizações de build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Code splitting otimizado
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'vendor-charts': ['recharts'],
          'vendor-leaflet': ['leaflet', 'react-leaflet', 'leaflet.markercluster'],
          'vendor-utils': ['date-fns', 'zod', 'clsx', 'tailwind-merge']
        }
      }
    },
    // Tamanho máximo de chunks
    chunkSizeWarningLimit: 1000,
    // Geração de source maps para debug
    sourcemap: false,
    // Manifest para cache
    manifest: true,
    // CSS otimizado
    cssCodeSplit: true,
    // Assets inline (menores que 4kb)
    assetsInlineLimit: 4096
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  // Otimizações de performance
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-leaflet',
      'leaflet',
      'recharts',
      'date-fns',
      'zod',
      'clsx',
      'tailwind-merge'
    ]
  }
});