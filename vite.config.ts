import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), basicSsl()],
  // Vercel serves this app at the domain root, so asset URLs must be `/assets/...`.
  // GitHub Pages often serves under `/<repo>/`, so we keep that base for non-Vercel builds.
  base: command === 'serve' ? '/' : process.env.VERCEL ? '/' : '/AR_UPDATE4/',
  server: {
    host: true, // Expose to your local network
    https: true, // Enable HTTPS
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('three')) return 'three';
          if (id.includes('react')) return 'react';
          if (id.includes('lucide-react')) return 'ui';
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
