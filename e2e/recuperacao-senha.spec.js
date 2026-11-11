import { expect, test } from './support/test.js';

const MENSAGEM_ENVIO =
  /Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha/;

test.use({ logado: false });

test.describe('esqueci a senha', () => {
  for (const email of ['davi@twist.app', 'ninguem@exemplo.com']) {
    test(`mesma mensagem de sucesso para ${email}`, async ({ page, api }) => {
      await page.goto('/esqueci-senha');
      await page.getByLabel('E-mail').fill(email);
      await page.getByRole('button', { name: 'Enviar link' }).click();

      await expect(page.getByRole('status')).toHaveText(MENSAGEM_ENVIO);
      expect(api.chamadasDe('POST', /password-reset\/$/)[0].corpo).toEqual({
        email,
      });
    });
  }

  test('e-mail inválido mostra validação', async ({ page, api }) => {
    await page.goto('/esqueci-senha');
    await page.getByLabel('E-mail').fill('invalido');
    await page.getByRole('button', { name: 'Enviar link' }).click();

    await expect(page.getByText('E-mail inválido.')).toBeVisible();
    expect(api.chamadasDe('POST', /password-reset/)).toHaveLength(0);
  });

  test('a partir do login chega à recuperação', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByRole('link', { name: 'Esqueci minha senha' }).click();
    await expect(page).toHaveURL(/\/esqueci-senha$/);
  });
});

test.describe('redefinir senha', () => {
  test('sucesso volta ao login com aviso', async ({ page, api }) => {
    await page.goto('/redefinir-senha/MQ/token-valido');
    await page
      .getByLabel('Nova senha', { exact: true })
      .fill('SenhaForte#2026');
    await page.getByLabel('Confirmar nova senha').fill('SenhaForte#2026');
    await page.getByRole('button', { name: 'Redefinir senha' }).click();

    await expect(page).toHaveURL(/\/entrar$/);
    await expect(page.getByRole('status')).toHaveText(
      'Senha redefinida. Entre com a nova senha.',
    );
    expect(
      api.chamadasDe('POST', /password-reset\/confirm\/$/)[0].corpo,
    ).toEqual({
      uid: 'MQ',
      token: 'token-valido',
      new_password: 'SenhaForte#2026',
    });
  });

  test('link inválido mostra mensagem e link para pedir outro', async ({
    page,
  }) => {
    await page.goto('/redefinir-senha/MQ/token-expirado');
    await page
      .getByLabel('Nova senha', { exact: true })
      .fill('SenhaForte#2026');
    await page.getByLabel('Confirmar nova senha').fill('SenhaForte#2026');
    await page.getByRole('button', { name: 'Redefinir senha' }).click();

    await expect(page.getByRole('alert')).toHaveText(
      'Link inválido ou expirado.',
    );
    const novo = page.getByRole('link', { name: 'Solicitar um novo link' });
    await expect(novo).toHaveAttribute('href', '/esqueci-senha');
    await novo.click();
    await expect(page).toHaveURL(/\/esqueci-senha$/);
  });

  test('senha curta é barrada no formulário', async ({ page, api }) => {
    await page.goto('/redefinir-senha/MQ/token-valido');
    await page.getByLabel('Nova senha', { exact: true }).fill('123');
    await page.getByLabel('Confirmar nova senha').fill('123');
    await page.getByRole('button', { name: 'Redefinir senha' }).click();

    await expect(
      page.getByText('A senha precisa ter pelo menos 8 caracteres.'),
    ).toBeVisible();
    expect(api.chamadasDe('POST', /confirm/)).toHaveLength(0);
  });

  test('senha fraca recusada pela API aparece no campo', async ({ page }) => {
    await page.goto('/redefinir-senha/MQ/token-valido');
    await page.getByLabel('Nova senha', { exact: true }).fill('senhafraca');
    await page.getByLabel('Confirmar nova senha').fill('senhafraca');
    await page.getByRole('button', { name: 'Redefinir senha' }).click();

    await expect(
      page.getByText('Esta senha é comum demais. Escolha outra.'),
    ).toBeVisible();
    await expect(page).toHaveURL(/redefinir-senha/);
  });

  test('confirmação diferente é barrada', async ({ page }) => {
    await page.goto('/redefinir-senha/MQ/token-valido');
    await page
      .getByLabel('Nova senha', { exact: true })
      .fill('SenhaForte#2026');
    await page.getByLabel('Confirmar nova senha').fill('OutraSenha#2026');
    await page.getByRole('button', { name: 'Redefinir senha' }).click();
    await expect(page.getByText('As senhas não coincidem.')).toBeVisible();
  });
});
