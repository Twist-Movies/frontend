import { defineConfig } from '@playwright/test';

const PORTA = 5188;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORTA}`,
    // Usa o Edge já instalado no Windows (nenhum navegador é baixado).
    // Para outro navegador: PW_CHANNEL=chrome npx playwright test
    channel: process.env.PW_CHANNEL || 'msedge',
    locale: 'pt-BR',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --port ${PORTA} --strictPort`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      // O app fala com /api; o Playwright responde tudo em page.route.
      VITE_API_MOCK: 'false',
      VITE_API_URL: '',
      VITE_API_PROXY_TARGET: 'http://127.0.0.1:9',
    },
  },
});
