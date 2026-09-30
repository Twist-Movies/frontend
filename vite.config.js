/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    // O pool padrão (forks) trava aguardando os workers responderem no Windows;
    // threads roda a mesma suíte sem o travamento.
    pool: 'threads',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      // A ficha do indicador 5 nomeia Istanbul/nyc — é ele que roda aqui.
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      // "Apenas linhas de código de produção, excluindo arquivos de
      // configuração, mocks e o próprio código de teste" — ficha 5.
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/test/**',
        'src/data/**',
        'src/types/**',
        'src/main.jsx',
      ],
      // Meta: >= 80%. Abaixo disso o pipeline falha.
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
});
