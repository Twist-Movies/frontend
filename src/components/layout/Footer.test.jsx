import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('mostra o ano atual e avisa que os dados são fictícios', () => {
    render(<Footer />);

    const rodape = screen.getByRole('contentinfo');
    expect(rodape).toHaveTextContent(`Twist ${new Date().getFullYear()}`);
    expect(rodape).toHaveTextContent(/dados fictícios/i);
  });
});
