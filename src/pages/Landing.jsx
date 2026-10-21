import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/landing/Hero';
import MediaCarousel from '../components/landing/MediaCarousel';
import About from '../components/landing/About';
import { isEnabled } from '../config/features';
import { films, series } from '../data/mock';

export default function Landing() {
  const { hash } = useLocation();

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

      {isEnabled('series') && (
        <MediaCarousel
          id="series"
          kind="serie"
          label="PARA MARATONAR"
          title="Séries populares"
          items={series}
          yearOf={(s) => s.startYear}
        />
      )}

      <About />
    </>
  );
}
