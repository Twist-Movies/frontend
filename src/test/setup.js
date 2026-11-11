import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

// Sob carga (Windows/CI) o padrão de 1s para findBy*/waitFor oscila; 5s evita flakes.
configure({ asyncUtilTimeout: 5000 });

// O jsdom não implementa estas APIs de navegador, que o carrossel (Embla) usa.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
class ObservadorFalso {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ObservadorFalso;
globalThis.IntersectionObserver ??= ObservadorFalso;

afterEach(() => {
  cleanup();
});
