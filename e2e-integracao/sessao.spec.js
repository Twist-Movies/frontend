import { expect, test } from '@playwright/test';

// Navegador -> Vite -> Django real: o refresh vive num cookie HttpOnly e o
// access só em memória. Sem page.route.
test.describe.configure({ mode: 'serial' });

const sufixo = Date.now().toString(36);
const usuario = {
  username: `ses${sufixo}`,
  email: `ses-${sufixo}@exemplo.com`,
  senha: 'SenhaSessao#2026',
};
const COOKIE = 'twist_refresh';
const JWT = /eyJ[\w-]+\.[\w-]+\.[\w-]*/;

async function entrar(page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail ou nome de usuário').fill(usuario.username);
  await page.getByLabel('Senha', { exact: true }).fill(usuario.senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/$/);
}

const cookieDoRefresh = async (context) =>
  (await context.cookies()).find((c) => c.name === COOKIE);

test('cadastra o usuário no backend real', async ({ request }) => {
  const resposta = await request.post('/api/accounts/register/', {
    multipart: {
      username: usuario.username,
      email: usuario.email,
      password: usuario.senha,
      first_name: 'Sessao',
      last_name: 'Teste',
      birth_date: '1995-04-12',
    },
  });
  expect(resposta.status(), await resposta.text()).toBe(201);
});

test('após o login nenhum JWT está no storage e o cookie é HttpOnly', async ({
  page,
  context,
}) => {
  await entrar(page);

  const { local, sessao, cookie } = await page.evaluate(() => ({
    local: { ...localStorage },
    sessao: { ...sessionStorage },
    cookie: document.cookie,
  }));
  for (const [chave, valor] of [
    ...Object.entries(local),
    ...Object.entries(sessao),
  ]) {
    expect(valor, `storage[${chave}] não pode conter JWT`).not.toMatch(JWT);
  }
  expect(local['twist:tokens']).toBeUndefined();
  expect(local['twist:session']).toBeUndefined();

  // O JavaScript não enxerga o cookie do refresh...
  expect(cookie).not.toContain(COOKIE);
  // ...mas o navegador o guarda, HttpOnly e restrito às rotas de conta.
  const c = await cookieDoRefresh(context);
  expect(c, 'cookie twist_refresh').toBeTruthy();
  expect(c.httpOnly).toBe(true);
  expect(c.sameSite).toBe('Lax');
  expect(c.path).toBe('/api/accounts/');
});

test('recarregar a página mantém a sessão (restauração via cookie)', async ({
  page,
}) => {
  await entrar(page);

  await page.reload();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('button', { name: 'Menu da conta' }),
  ).toBeVisible();

  await page.goto('/entrar');
  await expect(page).toHaveURL(/\/$/);
});

test('refresh com o cookie mas sem X-Twist-Client é negado', async ({
  page,
}) => {
  await entrar(page);

  // page.request compartilha o cookie do navegador, mas não envia o cabeçalho.
  const sem = await page.request.post('/api/accounts/token/refresh/');
  expect(sem.status()).toBe(403);
  expect(await sem.text()).not.toMatch(/"access"/);

  const com = await page.request.post('/api/accounts/token/refresh/', {
    headers: { 'X-Twist-Client': 'web' },
  });
  expect(com.status()).toBe(200);
  expect((await com.json()).access).toMatch(JWT);
});

test('logout apaga o cookie e recarregar volta ao login', async ({
  page,
  context,
}) => {
  await entrar(page);

  await page.getByRole('button', { name: 'Menu da conta' }).click();
  await page.getByRole('menuitem', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/(entrar|boas-vindas)$/);
  expect(await cookieDoRefresh(context)).toBeUndefined();

  await page.reload();
  await page.goto('/listas');
  await expect(page).toHaveURL(/\/entrar$/);

  const refresh = await page.request.post('/api/accounts/token/refresh/', {
    headers: { 'X-Twist-Client': 'web' },
  });
  expect(refresh.status()).toBe(401);
});

// ---- conta: troca de e-mail e exclusão (backend real) ----
const conta = {
  username: `cfg${sufixo}`,
  email: `cfg-${sufixo}@exemplo.com`,
  senha: 'SenhaConta#2026',
};

async function entrarComo(page, identifier, senha) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail ou nome de usuário').fill(identifier);
  await page.getByLabel('Senha', { exact: true }).fill(senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/$/);
}

test('cadastra a conta de configurações', async ({ request }) => {
  const resposta = await request.post('/api/accounts/register/', {
    multipart: {
      username: conta.username,
      email: conta.email,
      password: conta.senha,
      first_name: 'Conta',
      last_name: 'Config',
      birth_date: '1995-04-12',
    },
  });
  expect(resposta.status(), await resposta.text()).toBe(201);
});

test('trocar o e-mail sem a senha atual mostra o erro no campo', async ({
  page,
}) => {
  await entrarComo(page, conta.username, conta.senha);
  await page.goto('/configuracoes');
  await page.getByLabel('E-mail', { exact: true }).fill(`x-${conta.email}`);
  await page.getByLabel('Senha atual').fill('SenhaErrada#1');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();

  await expect(
    page.locator('[role="alert"], p').filter({ hasText: /senha/i }).first(),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/configuracoes$/);
  // continua logado
  await page.reload();
  await expect(page).toHaveURL(/\/configuracoes$/);
});

test('trocar o e-mail com a senha certa encerra a sessão', async ({
  page,
  context,
}) => {
  const novoEmail = `novo-${conta.email}`;
  await entrarComo(page, conta.username, conta.senha);
  await page.goto('/configuracoes');
  await page.getByLabel('E-mail', { exact: true }).fill(novoEmail);
  await page.getByLabel('Senha atual').fill(conta.senha);
  await page.getByRole('button', { name: 'Salvar alterações' }).click();

  await expect(page).toHaveURL(/\/entrar$/);
  await expect(
    page.getByText('E-mail alterado. Entre novamente.'),
  ).toBeVisible();
  expect(await cookieDoRefresh(context)).toBeUndefined();

  await page.goto('/configuracoes');
  await expect(page).toHaveURL(/\/entrar$/);
  await entrarComo(page, novoEmail, conta.senha);
});

test('excluir a conta exige a senha', async ({ page, request }) => {
  await entrarComo(page, conta.username, conta.senha);
  await page.goto('/configuracoes');
  await page.getByRole('button', { name: 'Excluir minha conta' }).click();
  await page
    .getByLabel('Confirme seu nome de usuário')
    .fill(conta.username.toUpperCase());
  await page.getByLabel('Senha atual').fill('SenhaErrada#1');
  await page.getByRole('button', { name: 'Excluir definitivamente' }).click();
  await expect(
    page.getByRole('dialog').getByText(/senha/i).first(),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/configuracoes$/);

  await page.getByLabel('Senha atual').fill(conta.senha);
  await page.getByRole('button', { name: 'Excluir definitivamente' }).click();
  await expect(page).toHaveURL(/\/entrar$/);

  const login = await request.post('/api/accounts/login/', {
    data: { identifier: conta.username, password: conta.senha },
  });
  expect(login.status()).toBe(401);
});
