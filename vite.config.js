import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the build works under a GitHub Pages project subpath
  // (e.g. /HabitTracker/) as well as at the domain root.
  base: './',
  server: {
    port: 5173,
    host: true,
  },
});
