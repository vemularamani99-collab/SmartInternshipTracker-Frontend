import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173, // Frontend dev server port

    // Proxy API requests to the Spring Boot backend during development.
    // Any request to /api/* will be forwarded to http://localhost:8080
    // This avoids CORS issues without needing browser extensions.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
