import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

export function renderWithRouter(ui, { route = '/', ...options } = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}
