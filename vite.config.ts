import path from 'path';
import { defineConfig } from 'vite'; // Removed loadEnv to avoid confusion
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  // We REMOVED the 'define' block. 
  // We will rely purely on import.meta.env.VITE_GEMINI_API_KEY
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});