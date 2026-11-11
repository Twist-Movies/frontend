import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { RedirectIfAuthenticated, RequireAuth } from './guards';

const SESSAO = {
  username: 'davi',
  displayName: 'Davi Almeida',
  email: 'davi@twist.app',
};

function SondaLogin() {
  const location = useLocation();
  const from = location.state?.from?.pathname;
  return (
    <div>
      <span data-testid="rota">{location.pathname}</span>
      <span data-testid="destino">{from ?? 'nenhum'}</span>
    </div>
  );
}

function montar(rota, session) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthProvider sessaoInicial={session}>
        <Routes>
          <Route path="/entrar" element={<SondaLogin />} />
          <Route element={<RedirectIfAuthenticated />}>
            <Route path="/boas-vindas" element={<p>landing</p>} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<p>feed</p>} />
            <Route path="/u/:username/diario" element={<p>diário</p>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('estado de carregamento (restaurando a sessão)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Promessa pendente: a restauração nunca termina durante o teste.
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );
    vi.stubEnv('VITE_API_MOCK', 'false');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('RequireAuth não redireciona nem mostra conteúdo enquanto restaura', () => {
    montar('/', undefined);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(screen.queryByText('feed')).not.toBeInTheDocument();
    expect(screen.queryByTestId('rota')).not.toBeInTheDocument();
  });

  it('RedirectIfAuthenticated também espera', () => {
    montar('/boas-vindas', undefined);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('landing')).not.toBeInTheDocument();
  });
});

describe('RequireAuth', () => {
  beforeEach(() => localStorage.clear());

  it('deixa passar quem está autenticado', () => {
    montar('/', SESSAO);

    expect(screen.getByText('feed')).toBeInTheDocument();
  });

  it('manda o visitante para o login', () => {
    montar('/', null);

    expect(screen.getByTestId('rota')).toHaveTextContent('/entrar');
  });

  it('guarda o destino pretendido para o login devolver o usuário lá', () => {
    montar('/u/davi/diario', null);

    expect(screen.getByTestId('destino')).toHaveTextContent('/u/davi/diario');
  });
});

describe('RedirectIfAuthenticated', () => {
  beforeEach(() => localStorage.clear());

  it('deixa o visitante ver a landing', () => {
    montar('/boas-vindas', null);

    expect(screen.getByText('landing')).toBeInTheDocument();
  });

  it('tira de lá quem já entrou', () => {
    montar('/boas-vindas', SESSAO);

    expect(screen.queryByText('landing')).not.toBeInTheDocument();
    expect(screen.getByText('feed')).toBeInTheDocument();
  });
});
