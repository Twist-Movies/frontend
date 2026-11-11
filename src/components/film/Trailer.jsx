import { useState } from 'react';
import { Play } from 'lucide-react';
import { imagemTmdb } from '../../lib/tmdbImage';

// Banner largo com o backdrop; ao clicar em play vira o player do YouTube.
export function Trailer({ chave, backdrop, titulo }) {
  const [tocando, setTocando] = useState(false);
  const imagem = imagemTmdb(backdrop, 'w1280');
  if (!chave && !imagem) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-line bg-surface-2">
      {tocando && chave ? (
        <iframe
          title={`Trailer de ${titulo}`}
          src={`https://www.youtube-nocookie.com/embed/${chave}?autoplay=1`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <>
          {imagem && (
            <img src={imagem} alt="" className="size-full object-cover" />
          )}
          {chave && (
            <button
              type="button"
              aria-label={`Assistir ao trailer de ${titulo}`}
              onClick={() => setTocando(true)}
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/35 transition hover:bg-black/50"
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-black shadow-lg sm:size-20">
                <Play
                  className="size-8 translate-x-0.5"
                  fill="currentColor"
                  aria-hidden="true"
                />
              </span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
