import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  // Support Telegram Mini App with proper HTTPS
  preview: {
    port: 3000,
    strictPort: true,
  },
  // Adjust as needed for your backend API
  proxy: {
    '/api': {
      target: 'https://your-backend-domain.herokuapp.com',
      changeOrigin: true,
      secure: false,
    },
  },
});