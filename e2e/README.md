# Testes end-to-end (Playwright)

Rodam o app real (`vite dev` na porta 5188) num navegador, com a API do backend
**simulada** por `page.route`: não precisam de backend, internet nem TMDB.

```bash
npm run e2e              # roda tudo (sobe o Vite sozinho, ou reaproveita o da porta 5188)
npm run e2e:ui           # modo interativo
npx playwright test e2e/filme.spec.js -g "meia estrela"
npx playwright show-report
```

## O que é simulado

- `e2e/support/api.js`: todas as rotas `/api/...` usadas pelo front (contas, usuários,
  catálogo, filme, reviews, playlists, feed, pessoas), com dados em `e2e/support/dados.js`
  no formato real do backend. O estado (assistido, nota, reação, seguindo, listas) é mutável
  por teste; `api.chamadas` / `api.chamadasDe(metodo, regex)` registram as requisições para
  conferir corpos (ex.: `PUT rating` com `stars: 3.5`).
- Imagens de `image.tmdb.org` respondem um PNG 1x1; qualquer outro host externo (YouTube,
  fontes) é bloqueado.
- `e2e/support/test.js`: fixture `test` com `api` automática e sessão já iniciada
  (`test.use({ logado: false })` para visitante).
- O servidor sobe com `VITE_API_MOCK=false` (o app fala com `/api`, interceptado).

## Navegador

O `playwright.config.js` usa o **Microsoft Edge já instalado** (`channel: 'msedge'`); nenhum
navegador é baixado (não rode `npx playwright install`). Para usar o Chrome:
`PW_CHANNEL=chrome npm run e2e`.

O Vitest ignora esta pasta (`test.exclude` em `vite.config.js`); o CI não roda os e2e.
