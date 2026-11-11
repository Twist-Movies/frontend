import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ResetPassword from './ResetPassword';

function json(status, corpo) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function usarApiReal(resposta) {
  vi.stubEnv('VITE_API_MOCK', 'false');
  const fetchMock = vi.fn().mockResolvedValue(resposta);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function Destino() {
  const { pathname, state } = useLocation();
  return (
    <span data-testid="rota">
      {pathname}|{state?.aviso}
    </span>
  );
}

function montar(token = 'tok') {
  render(
    <MemoryRouter initialEntries={[`/redefinir-senha/davi/${token}`]}>
      <Routes>
        <Route
          path="/redefinir-senha/:uid/:token"
          element={<ResetPassword />}
        />
        <Route path="*" element={<Destino />} />
      </Routes>
    </MemoryRouter>,
  );
}

const nova = () => screen.getByLabelText('Nova senha');
const confirmar = () => screen.getByLabelText('Confirmar nova senha');
const enviar = () =>
  userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }));

async function preencher(a = 'senhaforte1', b = a) {
  await userEvent.type(nova(), a);
  await userEvent.type(confirmar(), b);
}

describe('ResetPassword', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('cobra os campos e a confirmação igual', async () => {
    const fetchMock = usarApiReal(json(200, {}));
    montar();
    await enviar();
    expect(screen.getByText('Informe a nova senha.')).toBeInTheDocument();
    expect(screen.getByText('Repita a nova senha.')).toBeInTheDocument();

    await preencher('senhaforte1', 'outra');
    await enviar();
    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mostra o medidor de força', async () => {
    montar();
    await userEvent.type(nova(), 'senhaforte1!');
    expect(screen.getByRole('status')).toHaveTextContent('Força da senha');
  });

  it('redefine (modo simulado) e redireciona para o login com aviso', async () => {
    montar('valido');

    await preencher();
    await enviar();

    expect(await screen.findByTestId('rota')).toHaveTextContent(
      '/entrar|Senha redefinida',
    );
  });

  it('envia uid, token e new_password para a API', async () => {
    const fetchMock = usarApiReal(json(200, { detail: 'ok' }));
    montar();

    await preencher();
    await enviar();

    expect(await screen.findByTestId('rota')).toHaveTextContent('/entrar');
    const [url, opcoes] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/accounts/password-reset/confirm/');
    expect(JSON.parse(opcoes.body)).toEqual({
      uid: 'davi',
      token: 'tok',
      new_password: 'senhaforte1',
    });
  });

  it('mostra erro de senha fraca vindo da API no campo', async () => {
    usarApiReal(json(400, { new_password: ['This password is too common.'] }));
    montar();

    await preencher();
    await enviar();

    expect(
      await screen.findByText('Esta senha é comum demais. Escolha outra.'),
    ).toBeInTheDocument();
  });

  it('mostra link inválido com atalho para pedir outro', async () => {
    montar('expirado');

    await preencher();
    await enviar();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Link inválido ou expirado.',
    );
    expect(
      screen.getByRole('link', { name: 'Solicitar um novo link' }),
    ).toHaveAttribute('href', '/esqueci-senha');
  });

  it('mostra aviso em outras falhas (429)', async () => {
    usarApiReal(json(429, { detail: 'Request was throttled.' }));
    montar();

    await preencher();
    await enviar();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Muitas tentativas',
    );
  });
});
