# Twist
 Repositório Frontend do Projeto Twist.

React 19 + Vite + Tailwind CSS 4 + React Router 7, em JavaScript (JSX).
O que construir segue a especificação em
[Twist-Movies/docs](https://github.com/Twist-Movies/docs); a API é o
[Twist-Movies/backend](https://github.com/Twist-Movies/backend) (Django).

## Para Rodar o Projeto

```bash
git clone https://github.com/Twist-Movies/frontend.git
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. O Tailwind já vem configurado pelo plugin do Vite
(`@tailwindcss/vite`), não precisa rodar nenhum comando de inicialização.

### Modo demonstração x API real

Por padrão o front roda **sem o back-end**: login e cadastro são simulados no
navegador. Conta de demonstração: `davi@twist.app` (ou `davi`) / `twist1234`.

Para falar com a API do Django, suba o back-end em `localhost:8000` e crie um
`.env.local` (veja `.env.example`):

```bash
VITE_API_MOCK=false
```

Em desenvolvimento o Vite repassa `/api` para o Django (o back ainda não libera
CORS). Hoje a API real cobre login, cadastro, logout e renovação de token; o
resto das telas usa `src/data/mock.js` até os endpoints existirem.

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
  api/             cliente HTTP (JWT, renovação de token, erros do DRF) e auth real/simulada
  auth/            contexto da sessão, guards de rota, validação dos formulários
  config/          feature flags (séries em espera)
  components/
    landing/       Hero, carrossel de filmes e séries, Sobre
    layout/        topo do visitante, topo logado, menu da conta, rodapé
    ui/            Button, Field, Modal, PosterCard, StarRating, Tabs…
  data/mock.js     filmes, séries e atividade fictícios
  pages/           uma tela por rota (as ainda não feitas usam Stub)
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
