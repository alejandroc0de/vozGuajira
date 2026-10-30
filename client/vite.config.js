import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Todo lo que empiece por /api se reenvía al backend de Express.
    // Así React y la API parecen el mismo origen y no hace falta configurar CORS.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
