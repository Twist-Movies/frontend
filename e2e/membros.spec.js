import { expect, test } from './support/test.js';

test('rede vazia mostra o convite a seguir', async ({ page }) => {
  await page.goto('/membros');
  await expect(page.getByRole('heading', { name: 'Membros' })).toBeVisible();
  await expect(page.getByText('Você ainda não segue ninguém')).toBeVisible();
});

test('buscar uma pessoa e seguir / deixar de seguir', async ({ page, api }) => {
  await page.goto('/membros');
  await page.getByLabel('Buscar pessoas').fill('bru');

  await expect(page.getByRole('link', { name: 'Bruno Lima' })).toBeVisible();
  expect(
    api
      .chamadasDe('GET', /^\/users\/search\/$/)
      .some((c) => c.query.q === 'bru'),
  ).toBe(true);

  await page.getByRole('button', { name: 'Seguir bruno' }).click();
  const deixar = page.getByRole('button', { name: 'Deixar de seguir bruno' });
  await expect(deixar).toBeVisible();
  expect(api.chamadasDe('POST', /^\/users\/3\/follow\/$/)).toHaveLength(1);

  await deixar.click();
  await expect(
    page.getByRole('button', { name: 'Seguir bruno' }),
  ).toBeVisible();
  expect(api.chamadasDe('DELETE', /^\/users\/3\/follow\/$/)).toHaveLength(1);
});

test('quem foi seguido aparece na aba Seguindo', async ({ page }) => {
  await page.goto('/membros');
  await page.getByLabel('Buscar pessoas').fill('ana');
  await page.getByRole('button', { name: 'Seguir ana' }).click();
  await expect(
    page.getByRole('button', { name: 'Deixar de seguir ana' }),
  ).toBeVisible();

  await page.getByLabel('Buscar pessoas').clear();
  await expect(page.getByRole('tab', { name: /Seguindo \(1\)/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ana Souza' })).toBeVisible();
});

test('busca sem resultados e o próprio usuário não aparece', async ({
  page,
}) => {
  await page.goto('/membros');
  await page.getByLabel('Buscar pessoas').fill('davi');
  await expect(page.getByText('Ninguém encontrado')).toBeVisible();
});
