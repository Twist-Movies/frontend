import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const api = {
  canScrollPrev: vi.fn(() => false),
  canScrollNext: vi.fn(() => true),
  scrollPrev: vi.fn(),
  scrollNext: vi.fn(),
  on: vi.fn(() => api),
  off: vi.fn(() => api),
};

vi.mock('embla-carousel-react', () => ({
  default: () => [vi.fn(), api],
}));

const {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} = await import('./Carousel');

function Exemplo() {
  return (
    <Carousel aria-label="Exemplo">
      <CarouselContent>
        <CarouselItem>Um</CarouselItem>
        <CarouselItem>Dois</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

describe('Carousel', () => {
  it('expõe região, slides e setas acessíveis', () => {
    render(<Exemplo />);

    expect(screen.getByRole('region', { name: 'Exemplo' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeEnabled();
  });

  it('avança e volta pelas setas e pelo teclado', () => {
    render(<Exemplo />);

    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(api.scrollNext).toHaveBeenCalledTimes(1);

    const regiao = screen.getByRole('region', { name: 'Exemplo' });
    fireEvent.keyDown(regiao, { key: 'ArrowRight' });
    expect(api.scrollNext).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(regiao, { key: 'ArrowLeft' });
    expect(api.scrollPrev).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(regiao, { key: 'Enter' });
    expect(api.scrollPrev).toHaveBeenCalledTimes(1);
  });

  it('desliga os ouvintes ao desmontar', () => {
    const { unmount } = render(<Exemplo />);
    unmount();
    expect(api.off).toHaveBeenCalled();
  });

  it('avisa quando usado fora do <Carousel>', () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<CarouselNext />)).toThrow(/dentro de <Carousel>/);
    erro.mockRestore();
  });
});
