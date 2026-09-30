import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/landing/Hero';
import MediaCarousel from '../components/landing/MediaCarousel';
import About from '../components/landing/About';
import { films, series } from '../data/mock';

export default function Landing() {
  const { hash } = useLocation();

  // O menu do visitante aponta para /boas-vindas#secao; o router não rola
  // sozinho até a âncora.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <>
      <Hero />

      <MediaCarousel
        id="filmes"
        label="EM DESTAQUE"
        title="Filmes populares"
        items={films}
        yearOf={(film) => film.year}
      />

      <MediaCarousel
        id="series"
        kind="serie"
        label="PARA MARATONAR"
        title="Séries populares"
        items={series}
        yearOf={(s) => s.startYear}
      />

      <About />
    </>
  );
}
