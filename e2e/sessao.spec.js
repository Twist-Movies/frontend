import { expect, test } from './support/test.js';

const JWT = /eyJ[\w-]+\.[\w-]+\.[\w-]*/;

async function armazenamento(page) {
  return page.evaluate(() => ({
    local: { ...localStorage },
    sessao: { ...sessionStorage },
    cookie: document.cookie,
  }));
}

test.describe('sessão por cookie HttpOnly (API simulada)', () => {
  test('recarregar restaura a sessão via refresh, sem nada de token no storage', async ({
    page,
    api,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Olá, Davi Silva' }),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Olá, Davi Silva' }),
    ).toBeVisible();

    const refreshes = api.chamadasDe('POST', /^\/accounts\/token\/refresh\/$/);
    expect(refreshes.length).toBeGreaterThanOrEqual(2);

    const { local, sessao, cookie } = await armazenamento(page);
    const tudo = JSON.stringify({ local, sessao });
    expect(tudo).not.toMatch(JWT);
    expect(tudo).not.toContain('access-token');
    expect(local['twist:tokens']).toBeUndefined();
    expect(local['twist:session']).toBeUndefined();
    expect(cookie).not.toContain('twist_refresh');
  });

  test('sair apaga o cookie e recarregar volta ao login', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Olá, Davi Silva' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Menu da conta' }).click();
    await page.getByRole('menuitem', { name: 'Sair' }).click();
    await expect(page).toHaveURL(/\/(entrar|boas-vindas)$/);

    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === 'twist_refresh')).toBeUndefined();

    await page.goto('/listas');
    await expect(page).toHaveURL(/\/entrar$/);
  });

  test('refresh e logout enviam X-Twist-Client e credenciais', async ({
    page,
  }) => {
    const pedidos = [];
    page.on('request', (r) => {
      if (/\/accounts\/(token\/refresh|logout)\//.test(r.url()))
        pedidos.push(r);
    });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Olá, Davi Silva' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Menu da conta' }).click();
    await page.getByRole('menuitem', { name: 'Sair' }).click();
    await expect(page).toHaveURL(/\/(entrar|boas-vindas)$/);

    expect(pedidos.length).toBeGreaterThanOrEqual(2);
    for (const p of pedidos) {
      expect(await p.headerValue('x-twist-client')).toBe('web');
      expect(p.postData()).toBeNull();
    }
  });
});

test.describe('sessão (visitante)', () => {
  test.use({ logado: false });

  test('sem cookie, o boot não loga e o login não grava token no storage', async ({
    page,
  }) => {
    await page.goto('/filmes');
    await expect(page).toHaveURL(/\/entrar$/);

    await page.getByLabel('E-mail ou nome de usuário').fill('davi');
    await page.getByLabel('Senha', { exact: true }).fill('twist1234');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(
      page.getByRole('heading', { name: 'Olá, Davi Silva' }),
    ).toBeVisible();

    const { local, sessao, cookie } = await armazenamento(page);
    expect(JSON.stringify({ local, sessao })).not.toMatch(JWT);
    expect(cookie).not.toContain('twist_refresh');
    const c = (await page.context().cookies()).find(
      (x) => x.name === 'twist_refresh',
    );
    expect(c?.httpOnly).toBe(true);
  });
});
