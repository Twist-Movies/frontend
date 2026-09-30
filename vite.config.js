/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    // O pool padrão (forks) trava no Windows.
    pool: 'threads',
    // Formulários longos digitados campo a campo passam de 5s com a suíte inteira rodando.
    testTimeout: 15000,
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/test/**',
        'src/data/**',
        'src/main.jsx',
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
});
