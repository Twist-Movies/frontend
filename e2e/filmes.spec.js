import { expect, test } from './support/test.js';

const colunas = (page) =>
  page
    .locator('[data-slot="poster-grid"]')
    .evaluate(
      (el) =>
        getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length,
    );

test('alternar grade/lista persiste após recarregar', async ({ page }) => {
  await page.goto('/filmes');
  const grade = page.getByRole('button', { name: 'Ver em grade' });
  const lista = page.getByRole('button', { name: 'Ver em lista' });

  await expect(grade).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-slot="poster-grid"]')).toBeVisible();

  await lista.click();
  await expect(lista).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-slot="poster-grid"]')).toHaveCount(0);
  await expect(page.getByRole('list', { name: 'Filmes' })).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Ver em lista' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('list', { name: 'Filmes' })).toBeVisible();
  await expect(page.locator('[data-slot="poster-grid"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Ver em grade' }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Ver em grade' }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('a grade tem no máximo 6 colunas em 1440px', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/filmes');
  await expect(page.locator('[data-slot="poster-grid"] a')).toHaveCount(12);

  const n = await colunas(page);
  expect(n).toBeLessThanOrEqual(6);
  expect(n).toBe(6);
});

test('filtro por gênero fica na URL e consulta o catálogo', async ({
  page,
  api,
}) => {
  await page.goto('/filmes');
  await expect(
    page.locator('[data-slot="poster-grid"] a').first(),
  ).toBeVisible();

  await page.getByLabel('Gênero').selectOption('28');
  await expect(page).toHaveURL(/\/filmes\?genero=28$/);
  await expect
    .poll(() =>
      api.chamadasDe('GET', /discover/).some((c) => c.query.genre === '28'),
    )
    .toBe(true);

  // A URL é a fonte da verdade: abrir direto restaura o filtro.
  await page.goto('/filmes?genero=35');
  await expect(page.getByLabel('Gênero')).toHaveValue('35');
  await expect
    .poll(() =>
      api.chamadasDe('GET', /discover/).some((c) => c.query.genre === '35'),
    )
    .toBe(true);
});

test('clicar num filme da grade abre o detalhe', async ({ page }) => {
  await page.goto('/filmes');
  await page.getByRole('link', { name: 'Rio Fundo (2001)' }).click();
  await expect(page).toHaveURL(/\/filme\/605$/);
});
