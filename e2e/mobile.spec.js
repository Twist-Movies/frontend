import { devices } from '@playwright/test';
import { expect, test } from './support/test.js';

// Pixel 7 é Chromium (compatível com o Edge); a viewport é a de 375x812.
test.use({ ...devices['Pixel 7'], viewport: { width: 375, height: 812 } });

const inferior = (page) =>
  page.getByRole('navigation', { name: 'Navegação inferior' });

test('bottom nav aparece e o nav de topo fica oculto', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Olá, Davi Silva' }),
  ).toBeVisible();

  await expect(inferior(page)).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Navegação principal' }),
  ).toBeHidden();
});

test('bottom nav navega entre Início, Filmes, Listas e Membros', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Olá, Davi Silva' }),
  ).toBeVisible();

  const destinos = [
    ['Filmes', /\/filmes$/, 'Filmes'],
    ['Listas', /\/listas$/, 'Minhas listas'],
    ['Membros', /\/membros$/, 'Membros'],
    ['Início', /\/$/, 'Olá, Davi Silva'],
  ];
  for (const [rotulo, url, titulo] of destinos) {
    await inferior(page).getByRole('link', { name: rotulo }).click();
    await expect(page).toHaveURL(url);
    await expect(
      page.getByRole('heading', { name: titulo, level: undefined }).first(),
    ).toBeVisible();
    await expect(
      inferior(page).getByRole('link', { name: rotulo }),
    ).toHaveAttribute('aria-current', 'page');
  }
});

const TELAS = [
  ['/', (page) => page.getByRole('link', { name: 'Viral Um (2026)' })],
  ['/filmes', (page) => page.getByRole('link', { name: 'Matrix (1999)' })],
  ['/listas', (page) => page.getByRole('heading', { name: 'Minhas listas' })],
  ['/membros', (page) => page.getByRole('heading', { name: 'Membros' })],
  ['/busca', (page) => page.getByRole('heading', { name: 'Busca' })],
  [
    '/filme/603',
    (page) => page.getByRole('region', { name: 'Filmes semelhantes' }),
  ],
];

for (const [rota, pronto] of TELAS) {
  test(`sem rolagem horizontal em ${rota}`, async ({ page }) => {
    await page.goto(rota);
    await expect(pronto(page)).toBeVisible();

    const medidas = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      largura: window.innerWidth,
    }));
    expect(medidas.scroll).toBeLessThanOrEqual(medidas.largura);
  });
}
