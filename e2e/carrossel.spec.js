import { expect, test } from './support/test.js';

const fileira = (page) =>
  page.getByRole('region', { name: 'Destaques do momento', exact: true });

test('carrossel da home avança e volta pelas setas', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  const regiao = fileira(page);
  const anterior = regiao.getByRole('button', { name: 'Anterior' });
  const proximo = regiao.getByRole('button', { name: 'Próximo' });
  const primeiro = regiao.getByRole('link', { name: 'Matrix (1999)' });

  await expect(primeiro).toBeVisible();
  await expect(anterior).toBeDisabled();
  await expect(proximo).toBeEnabled();

  const antes = (await primeiro.boundingBox()).x;
  await proximo.click();

  // Depois de avançar, o primeiro pôster sai para a esquerda e dá pra voltar.
  await expect(anterior).toBeEnabled();
  await expect
    .poll(async () => (await primeiro.boundingBox()).x)
    .toBeLessThan(antes);

  await anterior.click();
  await expect(anterior).toBeDisabled();
  await expect
    .poll(async () => Math.round((await primeiro.boundingBox()).x))
    .toBe(Math.round(antes));
});

test('carrossel responde às setas do teclado e não tem barra de rolagem nativa', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  const regiao = fileira(page).getByRole('region', { name: /Carrossel/ });
  const primeiro = fileira(page).getByRole('link', { name: 'Matrix (1999)' });
  await expect(primeiro).toBeVisible();
  const antes = (await primeiro.boundingBox()).x;

  await primeiro.focus();
  await page.keyboard.press('ArrowRight');
  await expect
    .poll(async () => (await primeiro.boundingBox()).x)
    .toBeLessThan(antes);

  // Sem scroll nativo: a fileira é recortada pelo carrossel (overflow hidden).
  const overflow = await regiao.evaluate(
    (el) => getComputedStyle(el.firstElementChild).overflowX,
  );
  expect(overflow).toBe('hidden');
});

test('no celular as setas somem e o conteúdo continua dentro da tela', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  await expect(
    fileira(page).getByRole('link', { name: 'Matrix (1999)' }),
  ).toBeVisible();
  await expect(
    fileira(page).getByRole('button', { name: 'Próximo' }),
  ).toBeHidden();
  const semOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(semOverflow).toBe(true);
});
