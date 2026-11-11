import { expect, test } from './support/test.js';
import { SENHA_VALIDA } from './support/dados.js';

test.describe('autenticação (visitante)', () => {
  test.use({ logado: false });

  test('rota protegida redireciona para /entrar', async ({ page }) => {
    await page.goto('/filmes');
    await expect(page).toHaveURL(/\/entrar$/);
    await expect(
      page.getByRole('heading', { name: 'Entrar', level: 1 }),
    ).toBeVisible();
  });

  test('login válido por e-mail leva à home', async ({ page, api }) => {
    await page.goto('/entrar');
    await page.getByLabel('E-mail ou nome de usuário').fill('davi@twist.app');
    await page.getByLabel('Senha', { exact: true }).fill(SENHA_VALIDA);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { name: 'Olá, Davi Silva' }),
    ).toBeVisible();
    expect(api.chamadasDe('POST', /^\/accounts\/login\/$/)[0].corpo).toEqual({
      identifier: 'davi@twist.app',
      password: SENHA_VALIDA,
    });
  });

  test('login válido por nome de usuário', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByLabel('E-mail ou nome de usuário').fill('davi');
    await page.getByLabel('Senha', { exact: true }).fill(SENHA_VALIDA);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(
      page.getByRole('heading', { name: 'Olá, Davi Silva' }),
    ).toBeVisible();
  });

  test('login com senha errada mostra o erro e não entra', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByLabel('E-mail ou nome de usuário').fill('davi');
    await page.getByLabel('Senha', { exact: true }).fill('senha-errada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByRole('alert')).toHaveText(
      'E-mail, usuário ou senha incorretos.',
    );
    await expect(page).toHaveURL(/\/entrar$/);
  });

  test('login com campos vazios mostra validação sem chamar a API', async ({
    page,
    api,
  }) => {
    await page.goto('/entrar');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(
      page.getByText('Informe seu e-mail ou usuário.'),
    ).toBeVisible();
    await expect(page.getByText('Informe sua senha.')).toBeVisible();
    expect(api.chamadasDe('POST', /login/)).toHaveLength(0);
  });

  test('cadastro válido cria a conta, entra e vai à home', async ({
    page,
    api,
  }) => {
    await page.goto('/cadastro');
    await page.getByLabel('Nome', { exact: true }).fill('Maria');
    await page.getByLabel('Sobrenome').fill('Oliveira');
    await page.getByLabel('Nome de usuário').fill('maria');
    await page.getByLabel('E-mail', { exact: true }).fill('maria@twist.app');
    await page.getByLabel('Data de nascimento').fill('20/05/1999');
    await page.getByLabel('Senha', { exact: true }).fill(SENHA_VALIDA);

    const criar = page.getByRole('button', { name: 'Criar conta' });
    await expect(criar).toBeDisabled();
    await page.getByRole('checkbox', { name: /termos de uso/ }).check();
    await expect(criar).toBeEnabled();
    await criar.click();

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { name: 'Olá, Maria Oliveira' }),
    ).toBeVisible();
    expect(api.chamadasDe('POST', /^\/accounts\/register\/$/)).toHaveLength(1);
  });

  test('cadastro com username já existente mostra o erro no campo', async ({
    page,
  }) => {
    await page.goto('/cadastro');
    await page.getByLabel('Nome', { exact: true }).fill('Outro');
    await page.getByLabel('Sobrenome').fill('Davi');
    await page.getByLabel('Nome de usuário').fill('davi');
    await page.getByLabel('E-mail', { exact: true }).fill('outro@twist.app');
    await page.getByLabel('Data de nascimento').fill('20/05/1999');
    await page.getByLabel('Senha', { exact: true }).fill(SENHA_VALIDA);
    await page.getByRole('checkbox', { name: /termos de uso/ }).check();
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(
      page.getByText('Este nome de usuário já existe.'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/cadastro$/);
  });

  test('cadastro inválido mostra validações do formulário', async ({
    page,
    api,
  }) => {
    await page.goto('/cadastro');
    await page.getByLabel('E-mail', { exact: true }).fill('isso-nao-e-email');
    await page.getByLabel('Senha', { exact: true }).fill('123');
    await page.getByRole('checkbox', { name: /termos de uso/ }).check();
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByText('Informe seu nome.')).toBeVisible();
    await expect(page.getByText('E-mail inválido.')).toBeVisible();
    await expect(
      page.getByText('A senha precisa ter pelo menos 8 caracteres.'),
    ).toBeVisible();
    expect(api.chamadasDe('POST', /register/)).toHaveLength(0);
  });
});

test.describe('autenticação (logado)', () => {
  test('sair encerra a sessão e volta a proteger as rotas', async ({
    page,
    api,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Olá, Davi Silva' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Menu da conta' }).click();
    await page.getByRole('menuitem', { name: 'Sair' }).click();

    await expect(page).toHaveURL(/\/(entrar|boas-vindas)$/);
    expect(api.chamadasDe('POST', /^\/accounts\/logout\/$/)).toHaveLength(1);

    await page.goto('/listas');
    await expect(page).toHaveURL(/\/entrar$/);
  });

  test('logado, /entrar redireciona para a home', async ({ page }) => {
    await page.goto('/entrar');
    await expect(
      page.getByRole('heading', { name: 'Olá, Davi Silva' }),
    ).toBeVisible();
  });
});
