import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onSessionExpired, request } from './client';
import { getTokens, setTokens } from './tokens';

function resposta(status, corpo, tipo = 'application/json') {
  const texto =
    corpo === undefined
      ? null
      : typeof corpo === 'string'
        ? corpo
        : JSON.stringify(corpo);
  return new Response(texto, { status, headers: { 'content-type': tipo } });
}

let fetchMock;

beforeEach(() => {
  localStorage.clear();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('request', () => {
  it('chama /api por padrão e devolve o JSON', async () => {
    fetchMock.mockResolvedValue(resposta(200, { ok: true }));

    await expect(request('/movies/1/', { auth: false })).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/movies/1/',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('respeita VITE_API_URL', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.twist.app/api');
    fetchMock.mockResolvedValue(resposta(200, {}));

    await request('/x/', { auth: false });
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.twist.app/api/x/');
  });

  it('envia JSON com o cabeçalho certo', async () => {
    fetchMock.mockResolvedValue(resposta(201, { id: 1 }));

    await request('/playlists/', {
      method: 'POST',
      body: { name: 'Favoritos' },
      auth: false,
    });

    const [, opcoes] = fetchMock.mock.calls[0];
    expect(opcoes.headers['Content-Type']).toBe('application/json');
    expect(opcoes.body).toBe('{"name":"Favoritos"}');
  });

  it('envia FormData sem forçar Content-Type (o navegador põe o boundary)', async () => {
    fetchMock.mockResolvedValue(resposta(201, {}));
    const form = new FormData();
    form.append('username', 'davi');

    await request('/accounts/register/', {
      method: 'POST',
      body: form,
      auth: false,
    });

    const [, opcoes] = fetchMock.mock.calls[0];
    expect(opcoes.headers['Content-Type']).toBeUndefined();
    expect(opcoes.body).toBe(form);
  });

  it('manda o access token nas rotas autenticadas', async () => {
    setTokens({ access: 'acc', refresh: 'ref' });
    fetchMock.mockResolvedValue(resposta(200, {}));

    await request('/users/me/');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer acc');
  });

  it('não manda token em rota pública', async () => {
    setTokens({ access: 'acc', refresh: 'ref' });
    fetchMock.mockResolvedValue(resposta(200, {}));

    await request('/accounts/login/', {
      method: 'POST',
      body: {},
      auth: false,
    });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('devolve null em 205 (logout)', async () => {
    fetchMock.mockResolvedValue(resposta(205));

    await expect(
      request('/accounts/logout/', { method: 'POST', auth: false }),
    ).resolves.toBeNull();
  });

  it('devolve null quando o corpo vem vazio', async () => {
    fetchMock.mockResolvedValue(resposta(200, '', 'text/plain'));

    await expect(request('/x/', { auth: false })).resolves.toBeNull();
  });

  it('transforma erro do DRF em ApiError com erros por campo', async () => {
    fetchMock.mockResolvedValue(
      resposta(400, { email: ['Enter a valid email address.'] }),
    );

    await expect(
      request('/accounts/register/', { method: 'POST', body: {}, auth: false }),
    ).rejects.toMatchObject({
      status: 400,
      isClientError: true,
      fieldErrors: { email: 'E-mail inválido.' },
    });
  });

  it('trata 5xx com resposta em HTML como falha de sistema', async () => {
    fetchMock.mockResolvedValue(
      resposta(502, '<html>Bad gateway</html>', 'text/html'),
    );

    await expect(request('/x/', { auth: false })).rejects.toMatchObject({
      status: 502,
      isClientError: false,
    });
  });

  it('converte falha de rede em ApiError de status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(request('/x/', { auth: false })).rejects.toMatchObject({
      status: 0,
    });
  });
});

describe('renovação do token', () => {
  it('renova o access num 401 e repete a chamada', async () => {
    setTokens({ access: 'velho', refresh: 'ref' });
    fetchMock
      .mockResolvedValueOnce(
        resposta(401, { detail: 'Token expirado', code: 'token_not_valid' }),
      )
      .mockResolvedValueOnce(resposta(200, { access: 'novo' }))
      .mockResolvedValueOnce(resposta(200, { username: 'davi' }));

    await expect(request('/users/me/')).resolves.toEqual({ username: 'davi' });

    expect(fetchMock.mock.calls[1][0]).toBe('/api/accounts/token/refresh/');
    expect(fetchMock.mock.calls[1][1].body).toBe('{"refresh":"ref"}');
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe(
      'Bearer novo',
    );
    expect(getTokens()).toEqual({ access: 'novo', refresh: 'ref' });
  });

  it('guarda o refresh novo quando o back rotaciona', async () => {
    setTokens({ access: 'velho', refresh: 'ref' });
    fetchMock
      .mockResolvedValueOnce(resposta(401, {}))
      .mockResolvedValueOnce(resposta(200, { access: 'novo', refresh: 'ref2' }))
      .mockResolvedValueOnce(resposta(200, {}));

    await request('/x/');
    expect(getTokens()).toEqual({ access: 'novo', refresh: 'ref2' });
  });

  it('faz um único refresh para várias chamadas que recebem 401 juntas', async () => {
    setTokens({ access: 'velho', refresh: 'ref' });
    fetchMock.mockImplementation(async (url, opcoes) => {
      if (url.endsWith('/token/refresh/')) {
        return resposta(200, { access: 'novo' });
      }
      return opcoes.headers.Authorization === 'Bearer novo'
        ? resposta(200, { ok: 1 })
        : resposta(401, {});
    });

    await Promise.all([request('/a/'), request('/b/'), request('/c/')]);

    const refreshes = fetchMock.mock.calls.filter(([url]) =>
      url.endsWith('/token/refresh/'),
    );
    expect(refreshes).toHaveLength(1);
  });

  it('encerra a sessão e avisa quando o refresh é recusado', async () => {
    setTokens({ access: 'velho', refresh: 'revogado' });
    const aviso = vi.fn();
    const cancelar = onSessionExpired(aviso);
    fetchMock
      .mockResolvedValueOnce(resposta(401, {}))
      .mockResolvedValueOnce(resposta(401, { detail: 'Token is blacklisted' }));

    await expect(request('/users/me/')).rejects.toMatchObject({
      status: 401,
      message: 'Sua sessão expirou. Entre novamente.',
    });
    expect(getTokens()).toBeNull();
    expect(aviso).toHaveBeenCalledOnce();

    cancelar();
  });

  it('trata falha de rede no refresh como sessão expirada', async () => {
    setTokens({ access: 'velho', refresh: 'ref' });
    fetchMock
      .mockResolvedValueOnce(resposta(401, {}))
      .mockRejectedValueOnce(new TypeError('offline'));

    await expect(request('/x/')).rejects.toMatchObject({ status: 401 });
  });

  it('não tenta renovar sem tokens guardados', async () => {
    fetchMock.mockResolvedValue(resposta(401, { detail: 'Não autenticado.' }));

    await expect(request('/users/me/')).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('não tenta renovar em rota pública', async () => {
    setTokens({ access: 'a', refresh: 'r' });
    fetchMock.mockResolvedValue(
      resposta(401, { error: 'Invalid credentials' }),
    );

    await expect(
      request('/accounts/login/', { method: 'POST', body: {}, auth: false }),
    ).rejects.toMatchObject({
      message: 'E-mail, usuário ou senha incorretos.',
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('para de avisar depois de cancelar a inscrição', async () => {
    setTokens({ access: 'velho', refresh: 'x' });
    const aviso = vi.fn();
    onSessionExpired(aviso)();
    fetchMock
      .mockResolvedValueOnce(resposta(401, {}))
      .mockResolvedValueOnce(resposta(401, {}));

    await expect(request('/x/')).rejects.toBeDefined();
    expect(aviso).not.toHaveBeenCalled();
  });
});
