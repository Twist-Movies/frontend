import { expect, test } from './support/test.js';

test('home mostra as fileiras do catálogo', async ({ page, api }) => {
  await page.goto('/');

  const secao = (nome) => page.getByRole('region', { name: nome, exact: true });

  await expect(
    secao('Destaques do momento').getByRole('link', {
      name: 'Cidade Alta (2000)',
    }),
  ).toBeVisible();
  await expect(
    secao('Lançamentos').getByRole('link', { name: 'Estreia Um (2025)' }),
  ).toBeVisible();
  await expect(
    secao('Mais bem avaliados').getByRole('link', {
      name: 'Clássico Um (1972)',
    }),
  ).toBeVisible();
  await expect(
    secao('Em alta nesta semana').getByRole('link', {
      name: 'Viral Um (2026)',
    }),
  ).toBeVisible();

  const sorts = api
    .chamadasDe('GET', /^\/movies\/discover\/$/)
    .map((c) => c.query.sort);
  expect(sorts).toEqual(
    expect.arrayContaining(['popularity', 'release_date', 'rating']),
  );
});

test('banner de destaque usa o filme mais popular', async ({ page }) => {
  await page.goto('/');
  const banner = page.getByRole('region', { name: 'Destaque', exact: true });
  await expect(banner.getByRole('heading', { name: /Matrix/ })).toBeVisible();
  await banner.getByRole('link', { name: 'Ver detalhes' }).click();
  await expect(page).toHaveURL(/\/filme\/603$/);
});

test('clicar num filme abre /filme/:id', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('region', { name: 'Em alta nesta semana', exact: true })
    .getByRole('link', { name: 'Viral Dois (2026)' })
    .click();
  await expect(page).toHaveURL(/\/filme\/902$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Viral Dois' }),
  ).toBeVisible();
});

test('o logo leva de volta à home', async ({ page }) => {
  await page.goto('/listas');
  await expect(
    page.getByRole('heading', { name: 'Minhas listas' }),
  ).toBeVisible();
  await page.getByRole('banner').getByRole('link', { name: 'TWIST' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('heading', { name: 'Olá, Davi Silva' }),
  ).toBeVisible();
});

test('busca rápida da home leva à busca', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('search').getByLabel('Buscar filme').fill('matrix');
  await page
    .getByRole('search')
    .getByRole('button', { name: 'Buscar' })
    .click();
  await expect(page).toHaveURL(/\/busca\?q=matrix$/);
  await expect(page.getByRole('link', { name: 'Matrix (1999)' })).toBeVisible();
});
