import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth';

/** Sessão de referência usada pelos testes que precisam de alguém logado. */
export const sessaoDeTeste = {
  username: 'davi',
  displayName: 'Davi Almeida',
  email: 'davi@twist.app',
};

/**
 * Renderiza dentro de um router de memória. Quase todo componente do TWIST
 * usa Link ou hooks de rota, então este é o render padrão dos testes.
 */
export function renderWithRouter(ui, { route = '/', ...options } = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}

/** Como o anterior, mas com o AuthProvider por volta. */
export function renderWithAuth(
  ui,
  { route = '/', session = sessaoDeTeste, ...options } = {},
) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider sessaoInicial={session}>{children}</AuthProvider>
    </MemoryRouter>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}
