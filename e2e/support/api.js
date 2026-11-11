import {
  EM_ALTA,
  LANCAMENTOS,
  MELHORES,
  PESSOAS,
  PESSOA_DETALHE,
  PLAYLIST_OFICIAL,
  PNG_1X1,
  POPULARES,
  REVIEW_EXISTENTE,
  SEMELHANTES,
  SENHA_VALIDA,
  TODOS_OS_FILMES,
  USUARIO,
  detalheDoFilme,
  pagina,
  paginado,
} from './dados.js';

const json = (route, corpo, status = 200, headers = {}) =>
  route.fulfill({
    status,
    headers,
    contentType: 'application/json',
    body: JSON.stringify(corpo),
  });
const vazio = (route, status = 204, headers = {}) =>
  route.fulfill({ status, headers });

// Simula o cookie HttpOnly do refresh (Path restrito às rotas de conta).
const COOKIE_REFRESH =
  'twist_refresh=refresh-token-e2e; HttpOnly; Path=/api/accounts/; SameSite=Lax';
const COOKIE_REFRESH_APAGADO =
  'twist_refresh=; Max-Age=0; HttpOnly; Path=/api/accounts/; SameSite=Lax';

function lerCorpo(request) {
  const texto = request.postData();
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    // multipart: extrai os campos de texto simples.
    const campos = {};
    for (const m of texto.matchAll(/name="([^"]+)"\r?\n\r?\n([^\r\n]*)/g)) {
      campos[m[1]] = m[2];
    }
    return campos;
  }
}

const ehLocal = (url) => ['localhost', '127.0.0.1'].includes(url.hostname);

/**
 * Simula a API do backend (sem backend, sem TMDB, sem internet).
 *
 * Devolve `api` com:
 *  - `estado`: dados mutáveis (assistido, nota, reação, listas, seguindo...);
 *  - `chamadas`: histórico { metodo, caminho, query, corpo };
 *  - `chamadasDe(metodo, regex)`: filtro do histórico;
 *  - `responder(metodo, regex, fn)`: sobrescreve uma rota (fn(ctx) devolve true se tratou).
 */
export async function instalarApi(page) {
  const estado = {
    assistido: false,
    watchlist: false,
    reacao: null,
    nota: null,
    reviews: [{ ...REVIEW_EXISTENTE }],
    playlists: [],
    seguindo: [],
    proximoId: 100,
    usuario: USUARIO,
  };
  const chamadas = [];
  const sobrescritas = [];

  const api = {
    estado,
    chamadas,
    chamadasDe: (metodo, padrao) =>
      chamadas.filter((c) => c.metodo === metodo && padrao.test(c.caminho)),
    responder: (metodo, padrao, fn) =>
      sobrescritas.unshift({ metodo, padrao, fn }),
  };

  // Tudo fora do servidor local é bloqueado (YouTube, fontes, etc.).
  await page.route(
    (url) => !ehLocal(url),
    (route) => route.abort(),
  );
  // As rotas registradas por último têm prioridade: imagens do TMDB viram um PNG.
  await page.route(/^https:\/\/image\.tmdb\.org\//, (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: PNG_1X1 }),
  );

  // Só /api/... (o Vite também serve /src/api/*.js, que não pode ser interceptado).
  await page.route(
    (url) => ehLocal(url) && url.pathname.startsWith('/api/'),
    async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const metodo = request.method();
      const caminho = url.pathname.replace(/^\/api/, '');
      const query = url.searchParams;
      const corpo = lerCorpo(request);
      const cabecalhos = await request.allHeaders();
      chamadas.push({
        metodo,
        caminho,
        query: Object.fromEntries(query),
        corpo,
      });

      const ctx = { route, metodo, caminho, query, corpo, cabecalhos };
      for (const s of sobrescritas) {
        if (
          s.metodo === metodo &&
          s.padrao.test(caminho) &&
          (await s.fn(ctx))
        ) {
          return;
        }
      }
      return tratar(ctx, estado);
    },
  );

  return api;
}

function tratar({ route, metodo, caminho, query, corpo, cabecalhos }, estado) {
  const rota = `${metodo} ${caminho}`;
  const casa = (regex) => regex.exec(rota);

  // ---- contas ----
  if (rota === 'POST /accounts/login/') {
    const conhecido = [estado.usuario.username, estado.usuario.email].includes(
      corpo?.identifier,
    );
    const ok = conhecido && corpo?.password === SENHA_VALIDA;
    return ok
      ? json(
          route,
          { access: 'access-token', username: estado.usuario.username },
          200,
          { 'set-cookie': COOKIE_REFRESH },
        )
      : json(route, { error: 'Invalid credentials' }, 401);
  }
  if (rota === 'POST /accounts/register/') {
    if (corpo?.username === 'davi') {
      return json(
        route,
        { username: ['A user with that username already exists.'] },
        400,
      );
    }
    estado.usuario = {
      ...USUARIO,
      id: 50,
      username: corpo?.username,
      email: corpo?.email,
      first_name: corpo?.first_name,
      last_name: corpo?.last_name,
    };
    return json(route, estado.usuario, 201);
  }
  if (rota === 'POST /accounts/logout/') {
    if (cabecalhos['x-twist-client'] !== 'web') {
      return json(route, { detail: 'Cabeçalho ausente.' }, 403);
    }
    return vazio(route, 205, { 'set-cookie': COOKIE_REFRESH_APAGADO });
  }
  if (rota === 'POST /accounts/token/refresh/') {
    // Só renova com o cookie HttpOnly E o cabeçalho X-Twist-Client.
    const temCookie = /(^|;\s*)twist_refresh=[^;]+/.test(
      cabecalhos.cookie ?? '',
    );
    if (!temCookie || cabecalhos['x-twist-client'] !== 'web') {
      return json(route, { detail: 'Sem sessão.' }, 401);
    }
    return json(route, { access: 'access-token' });
  }
  if (rota === 'POST /accounts/password-reset/') {
    return json(route, {
      detail: 'Se existir uma conta com esse e-mail, enviamos um link.',
    });
  }
  if (rota === 'POST /accounts/password-reset/confirm/') {
    if (corpo?.token === 'token-expirado') {
      return json(route, { detail: 'Link inválido ou expirado.' }, 400);
    }
    if (corpo?.new_password === 'senhafraca') {
      return json(
        route,
        { new_password: ['This password is too common.'] },
        400,
      );
    }
    return json(route, { detail: 'Senha redefinida com sucesso.' });
  }

  // ---- usuários ----
  if (rota === 'GET /users/me/') return json(route, estado.usuario);
  if (rota === 'PATCH /users/me/') {
    const mudouEmail =
      corpo?.email !== undefined && corpo.email !== estado.usuario.email;
    if (mudouEmail && corpo.current_password !== SENHA_VALIDA) {
      return json(
        route,
        {
          current_password: [
            corpo.current_password
              ? 'Senha atual incorreta.'
              : 'Informe a senha atual para alterar o e-mail.',
          ],
        },
        400,
      );
    }
    const { current_password: _senha, ...campos } = corpo ?? {};
    estado.usuario = { ...estado.usuario, ...campos };
    // Trocar o e-mail revoga os refresh tokens e apaga o cookie.
    return json(
      route,
      estado.usuario,
      200,
      mudouEmail ? { 'set-cookie': COOKIE_REFRESH_APAGADO } : {},
    );
  }
  if (rota === 'DELETE /users/me/') {
    if (!corpo?.username || !corpo?.password) {
      return json(
        route,
        { error: 'Informe username e senha para excluir a conta.' },
        400,
      );
    }
    if (corpo.password !== SENHA_VALIDA) {
      return json(route, { password: ['Senha incorreta.'] }, 400);
    }
    return vazio(route, 204, { 'set-cookie': COOKIE_REFRESH_APAGADO });
  }
  if (rota === 'GET /users/search/') {
    const q = (query.get('q') ?? '').toLowerCase();
    return json(route, paginado(PESSOAS.filter((p) => p.username.includes(q))));
  }
  let m = casa(/^(POST|DELETE) \/users\/(\d+)\/follow\/$/);
  if (m) {
    const id = Number(m[2]);
    const pessoa = PESSOAS.find((p) => p.id === id);
    estado.seguindo = estado.seguindo.filter((p) => p.id !== id);
    if (m[1] === 'POST') estado.seguindo.push(pessoa);
    return vazio(route, m[1] === 'POST' ? 201 : 204);
  }
  m = casa(/^GET \/users\/(\d+)\/following\/$/);
  if (m) {
    const id = Number(m[1]);
    if (id === USUARIO.id) return json(route, paginado(estado.seguindo));
    return json(route, paginado(id === 2 ? [PESSOAS[2], PESSOAS[3]] : []));
  }
  if (casa(/^GET \/users\/\d+\/followers\/$/)) return json(route, paginado([]));
  if (casa(/^GET \/users\/\d+\/reviews\/$/)) return json(route, paginado([]));

  // ---- catálogo ----
  if (rota === 'GET /movies/discover/') {
    const sort = query.get('sort') ?? 'popularity';
    const lista = {
      popularity: POPULARES,
      release_date: LANCAMENTOS,
      rating: MELHORES,
    }[sort];
    return json(route, pagina(lista ?? POPULARES));
  }
  if (rota === 'GET /movies/trending/') return json(route, pagina(EM_ALTA));
  if (rota === 'GET /movies/search/') {
    const q = (query.get('q') ?? '').toLowerCase();
    return json(
      route,
      pagina(TODOS_OS_FILMES.filter((f) => f.title.toLowerCase().includes(q))),
    );
  }

  // ---- filme ----
  m = casa(/^GET \/movies\/(\d+)\/$/);
  if (m) return json(route, detalheDoFilme(Number(m[1]), estado));
  if (casa(/^GET \/movies\/\d+\/recommendations\/$/)) {
    return json(route, pagina(SEMELHANTES));
  }
  m = casa(/^(POST|DELETE) \/movies\/\d+\/watch\/$/);
  if (m) {
    estado.assistido = m[1] === 'POST';
    return vazio(route, m[1] === 'POST' ? 201 : 204);
  }
  m = casa(/^(POST|DELETE) \/movies\/\d+\/watchlist\/$/);
  if (m) {
    estado.watchlist = m[1] === 'POST';
    return vazio(route, m[1] === 'POST' ? 201 : 204);
  }
  if (casa(/^PUT \/movies\/\d+\/rating\/$/)) {
    estado.nota = corpo.stars;
    return json(route, { stars: corpo.stars });
  }
  if (casa(/^DELETE \/movies\/\d+\/rating\/$/)) {
    estado.nota = null;
    return vazio(route);
  }
  if (casa(/^PUT \/movies\/\d+\/reaction\/$/)) {
    estado.reacao = corpo.reaction;
    return json(route, { reaction: corpo.reaction });
  }
  if (casa(/^DELETE \/movies\/\d+\/reaction\/$/)) {
    estado.reacao = null;
    return vazio(route);
  }
  if (casa(/^GET \/movies\/\d+\/reviews\/$/)) {
    return json(route, paginado(estado.reviews));
  }
  if (casa(/^POST \/movies\/\d+\/reviews\/$/)) {
    const nova = {
      ...REVIEW_EXISTENTE,
      id: ++estado.proximoId,
      author: { id: USUARIO.id, username: USUARIO.username, avatar_url: null },
      content: corpo.content,
      contains_spoiler: Boolean(corpo.contains_spoiler),
      likes_count: 0,
    };
    estado.reviews.unshift(nova);
    return json(route, nova, 201);
  }
  m = casa(/^GET \/people\/(\d+)\/$/);
  if (m) return json(route, { ...PESSOA_DETALHE, id: Number(m[1]) });

  // ---- listas ----
  if (rota === 'GET /playlists/')
    return json(route, paginado(estado.playlists));
  if (rota === 'GET /playlists/official/') {
    return json(route, paginado([PLAYLIST_OFICIAL]));
  }
  if (rota === 'POST /playlists/') {
    const lista = {
      id: ++estado.proximoId,
      name: corpo.name,
      description: corpo.description ?? '',
      is_public: corpo.is_public !== false && corpo.is_public !== 'false',
      cover_url: null,
      owner_username: USUARIO.username,
      created_at: '2026-02-01T00:00:00Z',
      updated_at: '2026-02-01T00:00:00Z',
    };
    estado.playlists.push(lista);
    return json(route, lista, 201);
  }
  m = casa(/^GET \/playlists\/(\d+)\/$/);
  if (m) {
    const id = Number(m[1]);
    const lista = [...estado.playlists, PLAYLIST_OFICIAL].find(
      (l) => l.id === id,
    );
    return lista
      ? json(route, { ...lista, movies_count: 0, movies: [] })
      : json(route, { detail: 'Not found.' }, 404);
  }

  // ---- feed ----
  if (rota === 'GET /feed/') return json(route, paginado([]));

  return json(route, { detail: `Rota não simulada: ${rota}` }, 404);
}
