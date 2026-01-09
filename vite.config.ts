import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Set base to './' so it works on GitHub Pages subdirectories
  base: './',
});