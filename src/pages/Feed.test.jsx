import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithRouter } from '../test/utils';
import Feed from './Feed';
import { activity, films } from '../data/mock';

describe('Feed', () => {
  it('mostra a vitrine de populares com um pôster por filme', () => {
    renderWithRouter(<Feed />);

    const vitrine = screen.getByLabelText('Populares esta semana');
    expect(within(vitrine).getAllByRole('link')).toHaveLength(films.length);
  });

  it('liga a vitrine ao catálogo completo', () => {
    renderWithRouter(<Feed />);

    expect(screen.getByRole('link', { name: 'ver tudo' })).toHaveAttribute(
      'href',
      '/filmes',
    );
  });

  it('lista uma entrada por atividade de quem o usuário segue', () => {
    renderWithRouter(<Feed />);

    activity.forEach((item) => {
      expect(
        screen.getAllByRole('link', { name: item.username }).length,
      ).toBeGreaterThan(0);
    });
  });

  it('traduz cada tipo de atividade para uma frase em português', () => {
    renderWithRouter(<Feed />);

    expect(screen.getByText('resenhou')).toBeInTheDocument();
    expect(screen.getAllByText('assistiu').length).toBeGreaterThan(0);
    expect(screen.getByText('curtiu')).toBeInTheDocument();
    expect(screen.getByText('criou uma lista')).toBeInTheDocument();
  });

  it('mostra a nota apenas nas atividades que têm nota', () => {
    renderWithRouter(<Feed />);

    const comNota = activity.filter((a) => a.rating !== undefined);
    comNota.forEach((a) => {
      expect(
        screen.getAllByRole('img', { name: `${a.rating} de 5 estrelas` })
          .length,
      ).toBeGreaterThan(0);
    });
  });
});
