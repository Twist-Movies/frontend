# Twist
 Repositório Frontend do Projeto Twist.

React 19 + Vite + Tailwind CSS 4 + React Router 7, em JavaScript (JSX).
Ainda sem back-end: os dados vêm de `src/data/mock.js` e a autenticação é
simulada em `src/auth/session.js` — quando a API existir, só esses arquivos mudam.

## Para Rodar o Projeto

```bash
git clone https://github.com/Twist-Movies/frontend.git
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. O Tailwind já vem configurado pelo plugin do Vite
(`@tailwindcss/vite`), não precisa rodar nenhum comando de inicialização.

Conta de demonstração: `davi@twist.app` / `twist1234`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run lint` | Lint com oxlint |
| `npm test` | Roda a suíte de testes (Vitest + Testing Library) |
| `npm run coverage` | Testes com cobertura Istanbul — falha abaixo de 80% |

## Estrutura

```
src/
  auth/            sessão simulada, contexto, guards de rota, telas de identidade
  components/
    landing/       Hero, carrossel de filmes e séries, Sobre
    layout/        topo do visitante, topo logado, menu da conta, rodapé
    ui/            Button, Field, Modal, PosterCard, StarRating, Tabs…
  data/mock.js     filmes, séries e atividade fictícios
  pages/           uma tela por rota (as ainda não feitas usam Stub)
  types/index.js   modelo de domínio em JSDoc (vira o contrato da API)
  index.css        Tailwind + tokens de cor (tema escuro e claro)
```

As cores são tokens do tema (`bg-surface`, `text-muted`, `border-line`,
`bg-cta`…), definidos em `src/index.css`. Use esses nomes em vez de cores
soltas para o tema claro continuar funcionando.

## Fluxo de branches

- `main` — o que está publicado.
- `dev` — integração; as features entram aqui por pull request.
- `feat/...` — uma branch por entrega, criada a partir de `dev`.

O CI (`.github/workflows/ci.yml`) roda lint, build e testes com cobertura em
todo push e pull request para `main` e `dev`.

## Indicadores

A cobertura de testes (indicador 5, meta >= 80%) é medida aqui. O relatório
fica em `coverage/` e o CI publica o resumo em cada execução.
