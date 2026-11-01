import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/landing/Hero';
import MediaCarousel from '../components/landing/MediaCarousel';
import About from '../components/landing/About';
import { carregarVitrine } from '../lib/vitrine';
import { useAsync } from '../lib/useAsync';

export default function Landing() {
  const { hash } = useLocation();
  const { data, error, recarregar } = useAsync(carregarVitrine, []);

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  let status = 'loading';
  if (error) status = 'error';
  else if (data) status = 'ready';

  return (
    <>
      <Hero />

      <MediaCarousel
        id="filmes"
        label="EM DESTAQUE"
        title="Filmes populares"
        items={data ?? []}
        yearOf={(film) => film.year}
        status={status}
        onRetry={recarregar}
      />

      <About />
    </>
  );
}
