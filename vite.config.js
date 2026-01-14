import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Base URL for deployment (change if deploying to subdirectory)
  base: '/',
  
  // Development server
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  
  // Preview server
  preview: {
    port: 4173
  },
  
  // Build options
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React
          'react-vendor': ['react', 'react-dom'],
          // Supabase in its own chunk
          'supabase': ['@supabase/supabase-js']
        }
      }
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  
  // Path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  },
  
  // CSS options
  css: {
    devSourcemap: true
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js']
  },
  
  // Environment variables prefix
  envPrefix: 'VITE_'
});
