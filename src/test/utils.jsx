import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth';

export const sessaoDeTeste = {
  username: 'davi',
  displayName: 'Davi Almeida',
  email: 'davi@twist.app',
};

export function renderWithRouter(ui, { route = '/', ...options } = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}

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
