import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  base: '/AR_UPDATE4/', // 👈 Add this line (your repo name)
  server: {
    host: true, // Expose to your local network
    https: true, // Enable HTTPS
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
