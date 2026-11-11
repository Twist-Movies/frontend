import { expect, test } from './support/test.js';

test('estado vazio: criar a primeira lista pelo modal', async ({
  page,
  api,
}) => {
  await page.goto('/listas');
  await expect(
    page.getByText('Você ainda não criou nenhuma lista'),
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Criar minha primeira lista' })
    .click();
  const modal = page.getByRole('dialog', { name: 'Nova lista' });
  await expect(modal).toBeVisible();

  // Nome vazio é barrado antes de chamar a API.
  await modal.getByRole('button', { name: 'Salvar' }).click();
  await expect(modal.getByText('Dê um nome à lista.')).toBeVisible();
  expect(api.chamadasDe('POST', /^\/playlists\/$/)).toHaveLength(0);

  await modal.getByLabel('Nome').fill('Noite de sexta');
  await modal
    .getByLabel('Descrição (opcional)')
    .fill('Filmes para ver com amigos.');
  await modal.getByRole('button', { name: 'Salvar' }).click();

  await expect(page).toHaveURL(/\/lista\/\d+$/);
  await expect(
    page.getByRole('heading', { name: 'Noite de sexta', level: 1 }),
  ).toBeVisible();
  expect(api.chamadasDe('POST', /^\/playlists\/$/)[0].corpo).toMatchObject({
    name: 'Noite de sexta',
    description: 'Filmes para ver com amigos.',
    is_public: true,
  });
});

test('o modal de nova lista fecha com Esc e Cancelar', async ({ page }) => {
  await page.goto('/listas');
  await page.getByRole('button', { name: '+ Nova lista' }).click();
  const modal = page.getByRole('dialog', { name: 'Nova lista' });
  await expect(modal).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('mostra "Listas da equipe Twist"', async ({ page }) => {
  await page.goto('/listas');
  const equipe = page.getByRole('region', { name: 'Listas da equipe Twist' });
  await expect(equipe).toBeVisible();
  await equipe.getByRole('link', { name: /Essenciais da equipe/ }).click();
  await expect(page).toHaveURL(/\/lista\/500$/);
  await expect(
    page.getByRole('heading', { name: 'Essenciais da equipe', level: 1 }),
  ).toBeVisible();
});

test('a seção da equipe some quando a rota falha', async ({ page, api }) => {
  api.responder('GET', /^\/playlists\/official\/$/, async ({ route }) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: '{}',
    });
    return true;
  });
  await page.goto('/listas');
  await expect(
    page.getByRole('heading', { name: 'Minhas listas' }),
  ).toBeVisible();
  await expect(
    page.getByText('Você ainda não criou nenhuma lista'),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Listas da equipe Twist' }),
  ).toHaveCount(0);
});
