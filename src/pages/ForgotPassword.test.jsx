import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

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

function montar() {
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>,
  );
}

const enviar = () =>
  userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));

describe('ForgotPassword', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('valida o e-mail antes de chamar a API', async () => {
    const fetchMock = usarApiReal(json(200, {}));
    montar();
    await enviar();
    expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('E-mail'), 'x');
    await enviar();
    expect(screen.getByText('E-mail inválido.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mostra sempre a mesma mensagem de sucesso', async () => {
    const fetchMock = usarApiReal(json(200, { detail: 'ok' }));
    montar();

    await userEvent.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await enviar();

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Se existir uma conta com esse e-mail',
    );
    const [url, opcoes] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/accounts/password-reset/');
    expect(JSON.parse(opcoes.body)).toEqual({ email: 'a@b.co' });
  });

  it('funciona no modo simulado', async () => {
    montar();

    await userEvent.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await enviar();

    expect(await screen.findByRole('status')).toBeInTheDocument();
  });

  it('mostra o aviso quando a API limita as tentativas (429)', async () => {
    usarApiReal(
      json(429, {
        detail: 'Request was throttled. Expected available in 60 seconds.',
      }),
    );
    montar();

    await userEvent.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await enviar();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Muitas tentativas',
    );
  });
});
