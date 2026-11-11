import { defineConfig } from '@playwright/test';

// E2E de integração: navegador -> Vite (proxy real) -> Django real, com o
// e-mail capturado em arquivo. Não usa page.route para /api.
const PORTA_FRONT = 5189;
const PORTA_BACK = 8011;

export default defineConfig({
  testDir: './e2e-integracao',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results-integracao',
  use: {
    baseURL: `http://localhost:${PORTA_FRONT}`,
    channel: process.env.PW_CHANNEL || 'msedge',
    locale: 'pt-BR',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'node e2e-integracao/support/backend.mjs',
      url: `http://127.0.0.1:${PORTA_BACK}/api/schema/`,
      reuseExistingServer: false,
      timeout: 120_000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    },
    {
      command: `npm run dev -- --port ${PORTA_FRONT} --strictPort`,
      url: `http://localhost:${PORTA_FRONT}`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        VITE_API_MOCK: 'false',
        VITE_API_URL: '',
        VITE_API_PROXY_TARGET: `http://127.0.0.1:${PORTA_BACK}`,
      },
    },
  ],
});
