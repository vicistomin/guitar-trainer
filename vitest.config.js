import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['.context/**', 'playwright/**', 'dist/**', 'node_modules/**'],
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
});
