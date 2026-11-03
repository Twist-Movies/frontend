/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    // O back ainda não libera CORS: em dev o Vite repassa /api para o Django
    // (local ou o publicado no Render, conforme VITE_API_PROXY_TARGET).
    proxy: {
      '/api': {
        target:
          loadEnv(mode, process.cwd(), '').VITE_API_PROXY_TARGET ||
          'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    // O pool padrão (forks) trava no Windows.
    pool: 'threads',
    // Formulários longos digitados campo a campo passam de 5s com a suíte inteira rodando.
    testTimeout: 15000,
    globals: true,
    // Os testes de tela rodam com a autenticação simulada, salvo quando o
    // próprio teste pede a API real com vi.stubEnv.
    env: { VITE_API_MOCK: 'true' },
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
}));
