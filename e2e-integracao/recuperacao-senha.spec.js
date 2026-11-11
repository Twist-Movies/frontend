import { expect, test } from '@playwright/test';

import { arquivosDeEmail, esperarNovoEmail } from './support/email.js';

// Navegador -> Vite -> Django real -> e-mail gravado em arquivo. Sem page.route.
test.describe.configure({ mode: 'serial' });

const sufixo = Date.now().toString(36);
const usuario = {
  username: `qa${sufixo}`,
  email: `qa-${sufixo}@exemplo.com`,
  senhaAntiga: 'SenhaAntiga#2026',
  senhaNova: 'NovaSenhaForte#2027',
};
const MENSAGEM_ENVIO =
  /Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha/;

let linkUsado;

async function pedirLink(page, email) {
  await page.goto('/entrar');
  await page.getByRole('link', { name: 'Esqueci minha senha' }).click();
  await expect(page).toHaveURL(/\/esqueci-senha$/);
  await page.getByLabel('E-mail').fill(email);
  await page.getByRole('button', { name: 'Enviar link' }).click();
  await expect(page.getByRole('status')).toHaveText(MENSAGEM_ENVIO);
}

async function entrar(page, identifier, senha) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail ou nome de usuário').fill(identifier);
  await page.getByLabel('Senha', { exact: true }).fill(senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test('cadastra o usuário no backend real', async ({ request }) => {
  const resposta = await request.post('/api/accounts/register/', {
    multipart: {
      username: usuario.username,
      email: usuario.email,
      password: usuario.senhaAntiga,
      birth_date: '1995-04-12',
    },
  });
  expect(resposta.status(), await resposta.text()).toBe(201);
});

test('pede a recuperação e recebe o e-mail com o link', async ({ page }) => {
  const antes = arquivosDeEmail().length;
  await pedirLink(page, usuario.email);

  const email = await esperarNovoEmail(antes);
  expect(email.assunto).toBe('Redefinição de senha - Twist');
  expect(email.para).toContain(usuario.email);
  expect(email.link, 'link de redefinição no corpo do e-mail').toBeTruthy();
  expect(email.link).toMatch(
    /^http:\/\/localhost:5189\/redefinir-senha\/[\w-]+\/[\w-]+$/,
  );
  linkUsado = email.link;
});

test('redefine a senha pelo link e volta ao login com aviso', async ({
  page,
}) => {
  await page.goto(linkUsado);
  await page.getByLabel('Nova senha', { exact: true }).fill(usuario.senhaNova);
  await page.getByLabel('Confirmar nova senha').fill(usuario.senhaNova);
  await page.getByRole('button', { name: 'Redefinir senha' }).click();

  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByRole('status')).toHaveText(
    'Senha redefinida. Entre com a nova senha.',
  );
});

test('a senha antiga falha e a nova entra na home', async ({ page }) => {
  await entrar(page, usuario.email, usuario.senhaAntiga);
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/entrar$/);

  await entrar(page, usuario.email, usuario.senhaNova);
  await expect(page).toHaveURL(/\/$/);
});

test('reutilizar o mesmo link mostra link inválido', async ({ page }) => {
  await page.goto(linkUsado);
  await page.getByLabel('Nova senha', { exact: true }).fill('OutraSenha#2028x');
  await page.getByLabel('Confirmar nova senha').fill('OutraSenha#2028x');
  await page.getByRole('button', { name: 'Redefinir senha' }).click();

  await expect(page.getByRole('alert')).toHaveText(
    'Link inválido ou expirado.',
  );
  const novo = page.getByRole('link', { name: 'Solicitar um novo link' });
  await expect(novo).toHaveAttribute('href', '/esqueci-senha');
  await novo.click();
  await expect(page).toHaveURL(/\/esqueci-senha$/);
});

test('e-mail inexistente: mesma mensagem e nenhum e-mail novo', async ({
  page,
}) => {
  const antes = arquivosDeEmail().length;
  await pedirLink(page, `ninguem-${sufixo}@exemplo.com`);
  // A resposta já chegou (mensagem exibida) e o envio é síncrono no backend.
  expect(arquivosDeEmail()).toHaveLength(antes);
});

test('senha fraca é recusada e o link continua válido', async ({ page }) => {
  const antes = arquivosDeEmail().length;
  await pedirLink(page, usuario.email);
  const email = await esperarNovoEmail(antes);
  expect(email.link).toBeTruthy();

  await page.goto(email.link);
  await page.getByLabel('Nova senha', { exact: true }).fill('password123');
  await page.getByLabel('Confirmar nova senha').fill('password123');
  await page.getByRole('button', { name: 'Redefinir senha' }).click();

  // Erro de senha fraca vindo da API, sem cair em "link inválido".
  await expect(page.getByText(/comum demais/i)).toBeVisible();
  await expect(page.getByText('Link inválido ou expirado.')).toHaveCount(0);
  await expect(page).toHaveURL(email.link);

  // O mesmo link ainda funciona com uma senha forte.
  const forte = 'TerceiraSenha#2029';
  await page.getByLabel('Nova senha', { exact: true }).fill(forte);
  await page.getByLabel('Confirmar nova senha').fill(forte);
  await page.getByRole('button', { name: 'Redefinir senha' }).click();
  await expect(page).toHaveURL(/\/entrar$/);
});
