import { expect, test } from './support/test.js';
import { SENHA_VALIDA } from './support/dados.js';

async function abrir(page) {
  await page.goto('/configuracoes');
  await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible();
}

test.describe('configurações da conta', () => {
  test('"Senha atual" só aparece quando o e-mail muda', async ({ page }) => {
    await abrir(page);
    await expect(page.getByLabel('Senha atual')).toHaveCount(0);

    await page.getByLabel('E-mail', { exact: true }).fill('novo@twist.app');
    const senha = page.getByLabel('Senha atual');
    await expect(senha).toHaveAttribute('type', 'password');
    await expect(senha).toHaveAttribute('autocomplete', 'current-password');
  });

  test('trocar o e-mail com a senha certa encerra a sessão e avisa', async ({
    page,
    api,
  }) => {
    await abrir(page);
    await page.getByLabel('E-mail', { exact: true }).fill('novo@twist.app');
    await page.getByLabel('Senha atual').fill(SENHA_VALIDA);
    await page.getByRole('button', { name: 'Salvar alterações' }).click();

    await expect(page).toHaveURL(/\/entrar$/);
    await expect(
      page.getByText('E-mail alterado. Entre novamente.'),
    ).toBeVisible();
    const patch = api.chamadasDe('PATCH', /^\/users\/me\/$/)[0];
    expect(patch.corpo.current_password).toBe(SENHA_VALIDA);

    await page.goto('/listas');
    await expect(page).toHaveURL(/\/entrar$/);
  });

  test('senha atual errada aparece no campo e mantém a sessão', async ({
    page,
  }) => {
    await abrir(page);
    await page.getByLabel('E-mail', { exact: true }).fill('novo@twist.app');
    await page.getByLabel('Senha atual').fill('errada');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();

    await expect(page.getByText('Senha atual incorreta.')).toBeVisible();
    await expect(page).toHaveURL(/\/configuracoes$/);
  });

  test('excluir conta pede username (sem diferenciar caixa) e senha', async ({
    page,
    api,
  }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Excluir minha conta' }).click();
    const confirmar = page.getByRole('button', {
      name: 'Excluir definitivamente',
    });
    await expect(confirmar).toBeDisabled();

    await page.getByLabel('Confirme seu nome de usuário').fill('DAVI');
    await expect(confirmar).toBeDisabled();
    await page.getByLabel('Senha atual').fill('errada');
    await confirmar.click();
    await expect(page.getByText('Senha incorreta.')).toBeVisible();

    await page.getByLabel('Senha atual').fill(SENHA_VALIDA);
    await confirmar.click();
    await expect(page).toHaveURL(/\/entrar$/);
    expect(api.chamadasDe('DELETE', /^\/users\/me\/$/).at(-1).corpo).toEqual({
      username: 'davi',
      password: SENHA_VALIDA,
    });
  });
});
