import { expect, test } from './support/test.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/filme/603');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Matrix' }),
  ).toBeVisible();
});

test.describe('ações (ícones)', () => {
  test('assistido alterna e chama a API', async ({ page, api }) => {
    const botao = page.getByRole('button', { name: 'Assistido', exact: true });
    await expect(botao).toHaveAttribute('aria-pressed', 'false');

    await botao.click();
    await expect(botao).toHaveAttribute('aria-pressed', 'true');
    expect(api.chamadasDe('POST', /\/movies\/603\/watch\/$/)).toHaveLength(1);

    await botao.click();
    await expect(botao).toHaveAttribute('aria-pressed', 'false');
    expect(api.chamadasDe('DELETE', /\/movies\/603\/watch\/$/)).toHaveLength(1);
  });

  test('quero assistir alterna e chama a API', async ({ page, api }) => {
    const botao = page.getByRole('button', { name: 'Quero assistir' });
    await expect(botao).toHaveAttribute('aria-pressed', 'false');
    await botao.click();
    await expect(botao).toHaveAttribute('aria-pressed', 'true');
    expect(api.chamadasDe('POST', /\/movies\/603\/watchlist\/$/)).toHaveLength(
      1,
    );
  });

  test('gostei (coração) usa aria-pressed e PUT/DELETE de reação', async ({
    page,
    api,
  }) => {
    const gostei = page.getByRole('button', { name: 'Gostei', exact: true });
    await expect(gostei).toHaveAttribute('aria-pressed', 'false');

    await gostei.click();
    await expect(gostei).toHaveAttribute('aria-pressed', 'true');
    expect(
      api.chamadasDe('PUT', /\/movies\/603\/reaction\/$/)[0].corpo,
    ).toEqual({
      reaction: 'LIKE',
    });

    // Trocar para "não gostei" desliga o coração.
    const naoGostei = page.getByRole('button', { name: 'Não gostei' });
    await naoGostei.click();
    await expect(naoGostei).toHaveAttribute('aria-pressed', 'true');
    await expect(gostei).toHaveAttribute('aria-pressed', 'false');

    await naoGostei.click();
    await expect(naoGostei).toHaveAttribute('aria-pressed', 'false');
    expect(api.chamadasDe('DELETE', /\/movies\/603\/reaction\/$/)).toHaveLength(
      1,
    );
  });
});

test.describe('nota em estrelas', () => {
  test('clicar na metade esquerda da 4ª estrela envia 3,5', async ({
    page,
    api,
  }) => {
    const grupo = page.getByRole('radiogroup', { name: 'Sua nota' });
    const metadeEsquerda = grupo.getByRole('radio', { name: '3,5 estrelas' });
    const metadeDireita = grupo.getByRole('radio', { name: '4 estrelas' });

    // Geometria: as duas metades da 4ª estrela dividem a mesma estrela.
    await metadeEsquerda.scrollIntoViewIfNeeded();
    const esq = await metadeEsquerda.boundingBox();
    const dir = await metadeDireita.boundingBox();
    expect(esq.x).toBeLessThan(dir.x);
    expect(Math.abs(esq.x + esq.width - dir.x)).toBeLessThan(1.5);

    // Clica no centro da metade esquerda, como um usuário faria com o mouse.
    await page.mouse.click(esq.x + esq.width / 2, esq.y + esq.height / 2);

    await expect(metadeEsquerda).toBeChecked();
    const puts = api.chamadasDe('PUT', /\/movies\/603\/rating\/$/);
    expect(puts).toHaveLength(1);
    expect(puts[0].corpo).toEqual({ stars: 3.5 });
  });

  test('metade direita da 4ª estrela envia 4 e repetir remove a nota', async ({
    page,
    api,
  }) => {
    const grupo = page.getByRole('radiogroup', { name: 'Sua nota' });
    await grupo.getByRole('radio', { name: '4 estrelas' }).click();
    await expect(
      grupo.getByRole('radio', { name: '4 estrelas' }),
    ).toBeChecked();
    expect(api.chamadasDe('PUT', /rating\/$/)[0].corpo).toEqual({ stars: 4 });

    await grupo.getByRole('radio', { name: '4 estrelas' }).click();
    await expect(
      grupo.getByRole('radio', { name: '4 estrelas' }),
    ).not.toBeChecked();
    expect(api.chamadasDe('DELETE', /rating\/$/)).toHaveLength(1);
  });
});

test('mostra a aprovação do filme', async ({ page }) => {
  const aprovacao = page.getByTestId('aprovacao');
  await expect(aprovacao).toContainText('92% de aprovação');
  await expect(aprovacao).toContainText('25 votos');
});

test('mostra o selo de classificação indicativa', async ({ page }) => {
  const selo = page.getByRole('img', {
    name: 'Classificação indicativa: 12 anos',
  });
  await expect(selo).toBeVisible();
  await expect(selo).toHaveAttribute('data-classificacao', '12');
});

test('gêneros são links para /filmes?genero=id', async ({ page, api }) => {
  const acao = page.getByRole('link', { name: 'Ação' });
  await expect(acao).toHaveAttribute('href', '/filmes?genero=28');
  await expect(
    page.getByRole('link', { name: 'Ficção científica' }),
  ).toHaveAttribute('href', '/filmes?genero=878');

  await acao.click();
  await expect(page).toHaveURL(/\/filmes\?genero=28$/);
  await expect(page.getByLabel('Gênero')).toHaveValue('28');
  await expect
    .poll(() =>
      api.chamadasDe('GET', /discover/).some((c) => c.query.genre === '28'),
    )
    .toBe(true);
});

test('elenco mostra os principais e expande em "ver elenco completo"', async ({
  page,
}) => {
  const elenco = page.getByRole('region', { name: 'Elenco', exact: true });
  const membros = elenco.getByRole('button', { name: /Ver detalhes de/ });
  await expect(membros).toHaveCount(3);

  const ver = elenco.getByRole('button', { name: 'Ver elenco completo' });
  await ver.click();
  await expect(membros).toHaveCount(5);

  await elenco.getByRole('button', { name: 'Mostrar menos' }).click();
  await expect(membros).toHaveCount(3);
});

test('clicar no diretor abre o modal da pessoa', async ({ page, api }) => {
  await page
    .locator('p', { hasText: 'Direção de' })
    .getByRole('button', { name: 'Lana Wachowski' })
    .click();

  const modal = page.getByRole('dialog', { name: 'Lana Wachowski' });
  await expect(modal).toBeVisible();
  await expect(
    modal.getByText('Diretora e roteirista norte-americana.'),
  ).toBeVisible();
  // (o StrictMode do React duplica o efeito em dev, então pode haver 2 GETs)
  expect(api.chamadasDe('GET', /^\/people\/9340\/$/).length).toBeGreaterThan(0);

  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('ampliar pôster: abre, Esc fecha e o foco volta ao botão', async ({
  page,
}) => {
  const botao = page.getByRole('button', { name: 'Ampliar pôster' });
  await botao.click();

  const lightbox = page.getByRole('dialog', { name: 'Pôster de Matrix' });
  await expect(lightbox).toBeVisible();
  await expect(page.getByRole('button', { name: 'Fechar' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();
  await expect(botao).toBeFocused();
});

test('trailer vira iframe do YouTube ao dar play', async ({ page }) => {
  await expect(page.locator('iframe')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Assistir ao trailer de Matrix' })
    .click();

  const player = page.locator('iframe[title="Trailer de Matrix"]');
  await expect(player).toHaveCount(1);
  await expect(player).toHaveAttribute(
    'src',
    /youtube-nocookie\.com\/embed\/abc123XYZ00/,
  );
});

test('filmes semelhantes vêm das recomendações', async ({ page }) => {
  const secao = page.getByRole('region', { name: 'Filmes semelhantes' });
  await expect(
    secao.getByRole('link', { name: 'Parecido Um (2003)' }),
  ).toBeVisible();
  await secao.getByRole('link', { name: 'Parecido Dois (2003)' }).click();
  await expect(page).toHaveURL(/\/filme\/1002$/);
});

test('comentários do filme: lista e publica', async ({ page, api }) => {
  await expect(
    page.getByText('Um clássico que envelheceu muito bem.'),
  ).toBeVisible();

  await page
    .getByRole('textbox', { name: /resenha|coment/i })
    .fill('Melhor filme de ficção.');
  await page.getByRole('button', { name: /publicar/i }).click();

  await expect(page.getByText('Melhor filme de ficção.')).toBeVisible();
  expect(
    api.chamadasDe('POST', /\/movies\/603\/reviews\/$/)[0].corpo,
  ).toMatchObject({
    content: 'Melhor filme de ficção.',
    contains_spoiler: false,
  });
});
