import { expect, test as base } from '@playwright/test';
import { instalarApi } from './api.js';

// Sessão já iniciada: semeia o cookie HttpOnly de refresh (o app o troca por
// um access em memória no carregamento, via /accounts/token/refresh/).
// Semeia só uma vez: depois de um logout (cookie apagado), não recria a sessão.
export async function autenticar(page) {
  const context = page.context();
  if (context.__twistSemeado) return;
  context.__twistSemeado = true;
  await context.addCookies([
    {
      name: 'twist_refresh',
      value: 'refresh-token-e2e',
      domain: 'localhost',
      path: '/api/accounts/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * `api`: API simulada já instalada na página (ver support/api.js).
 * `logado`: página com sessão iniciada (use `test.use({ logado: false })` para visitante).
 */
export const test = base.extend({
  logado: [true, { option: true }],
  api: [
    async ({ page, logado }, use) => {
      const api = await instalarApi(page);
      if (logado) await autenticar(page);
      await use(api);
    },
    { auto: true },
  ],
});

export { expect };
