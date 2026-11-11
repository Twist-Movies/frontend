import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../lib/cx';

// Carrossel no padrão do shadcn/ui (Carousel, CarouselContent, CarouselItem,
// CarouselPrevious, CarouselNext), sobre o Embla. Arrasta com o mouse, desliza
// no toque e responde às setas do teclado.
const CarouselContext = createContext(null);

function useCarousel() {
  const contexto = useContext(CarouselContext);
  if (!contexto) {
    throw new Error(
      'Os componentes do carrossel precisam estar dentro de <Carousel>.',
    );
  }
  return contexto;
}

export function Carousel({ opts, className, children, ...props }) {
  const [viewportRef, api] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 'auto',
    dragFree: true,
    ...opts,
  });
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  const atualizar = useCallback((emblaApi) => {
    setPodeVoltar(emblaApi.canScrollPrev());
    setPodeAvancar(emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return undefined;
    atualizar(api);
    api.on('reInit', atualizar).on('select', atualizar).on('scroll', atualizar);
    return () => {
      api
        .off('reInit', atualizar)
        .off('select', atualizar)
        .off('scroll', atualizar);
    };
  }, [api, atualizar]);

  const voltar = useCallback(() => api?.scrollPrev(), [api]);
  const avancar = useCallback(() => api?.scrollNext(), [api]);

  function aoTeclar(evento) {
    if (evento.key === 'ArrowLeft') {
      evento.preventDefault();
      voltar();
    } else if (evento.key === 'ArrowRight') {
      evento.preventDefault();
      avancar();
    }
  }

  return (
    <CarouselContext.Provider
      value={{ viewportRef, voltar, avancar, podeVoltar, podeAvancar }}
    >
      <div
        role="region"
        aria-roledescription="carrossel"
        onKeyDownCapture={aoTeclar}
        className={cx('group/carousel relative', className)}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }) {
  const { viewportRef } = useCarousel();
  return (
    <div ref={viewportRef} className="overflow-hidden">
      <ul
        className={cx('-ml-3 flex pt-1 pb-1 sm:-ml-4', className)}
        {...props}
      />
    </div>
  );
}

export function CarouselItem({ className, ...props }) {
  return (
    <li
      aria-roledescription="slide"
      className={cx(
        'min-w-0 shrink-0 grow-0 basis-auto pl-3 sm:pl-4',
        className,
      )}
      {...props}
    />
  );
}

const BOTAO_SETA =
  'absolute top-[38%] z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/95 text-fg shadow-lg backdrop-blur transition hover:border-accent hover:text-accent focus-visible:flex focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-0 md:flex';

export function CarouselPrevious({ className, ...props }) {
  const { voltar, podeVoltar } = useCarousel();
  return (
    <button
      type="button"
      aria-label="Anterior"
      disabled={!podeVoltar}
      onClick={voltar}
      className={cx(BOTAO_SETA, '-left-3', className)}
      {...props}
    >
      <ChevronLeft className="size-5" aria-hidden="true" />
    </button>
  );
}

export function CarouselNext({ className, ...props }) {
  const { avancar, podeAvancar } = useCarousel();
  return (
    <button
      type="button"
      aria-label="Próximo"
      disabled={!podeAvancar}
      onClick={avancar}
      className={cx(BOTAO_SETA, '-right-3', className)}
      {...props}
    >
      <ChevronRight className="size-5" aria-hidden="true" />
    </button>
  );
}
