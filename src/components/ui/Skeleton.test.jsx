import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { PosterGridSkeleton, Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('fica fora da árvore de acessibilidade', () => {
    const { container } = render(<Skeleton />);

    expect(container.querySelector('[data-slot="skeleton"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('aplica as dimensões pedidas', () => {
    const { container } = render(
      <Skeleton width={120} height={8} radius={4} />,
    );

    expect(container.querySelector('[data-slot="skeleton"]')).toHaveStyle({
      width: '120px',
      height: '8px',
    });
  });
});

describe('PosterGridSkeleton', () => {
  it('marca a grade como ocupada e usa a contagem padrão', () => {
    const { container } = render(<PosterGridSkeleton />);

    expect(container.querySelector('[data-slot="poster-grid"]')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(container.querySelectorAll('[data-slot="poster-grid"] > div')).toHaveLength(12);
  });

  it('respeita a contagem pedida', () => {
    const { container } = render(<PosterGridSkeleton count={3} />);

    expect(container.querySelectorAll('[data-slot="poster-grid"] > div')).toHaveLength(3);
  });
});
