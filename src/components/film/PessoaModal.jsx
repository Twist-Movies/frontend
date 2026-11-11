import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, ErrorState, Modal, PosterGrid, Skeleton } from '../ui';
import { detalheDaPessoa } from '../../api/movies';
import { useAsync } from '../../lib/useAsync';
import { anoDe, imagemTmdb } from '../../lib/tmdbImage';
import { inicial } from '../../lib/filme';

const LIMITE_BIO = 400;

function Conteudo({ pessoaId, nome }) {
  const [lerMais, setLerMais] = useState(false);
  const { data, error, loading, recarregar } = useAsync(
    () => detalheDaPessoa(pessoaId),
    [pessoaId],
  );

  if (error) return <ErrorState error={error} onRetry={recarregar} />;
  if (!data) {
    return loading ? (
      <div
        className="flex flex-col gap-3"
        aria-busy="true"
        data-testid="pessoa-carregando"
      >
        <Skeleton height={96} width={96} radius={999} />
        <Skeleton height={14} />
        <Skeleton height={14} width="80%" />
      </div>
    ) : null;
  }

  const foto = imagemTmdb(data.profile_path, 'w185');
  const bio = data.biography ?? '';
  const longa = bio.length > LIMITE_BIO;
  const textoBio =
    longa && !lerMais ? `${bio.slice(0, LIMITE_BIO).trimEnd()}…` : bio;
  const detalhes = [
    data.known_for_department,
    data.birthday,
    data.place_of_birth,
  ].filter(Boolean);
  const filmes = data.movies ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2 text-3xl font-bold text-faint">
          {foto ? (
            <img
              src={foto}
              alt={`Foto de ${data.name ?? nome}`}
              className="size-full object-cover"
            />
          ) : (
            <span aria-hidden="true">{inicial(data.name ?? nome)}</span>
          )}
        </span>
        <div>
          <h4 className="text-xl font-black">{data.name ?? nome}</h4>
          {detalhes.length > 0 && (
            <p className="text-sm text-muted">{detalhes.join(' · ')}</p>
          )}
        </div>
      </div>

      {bio ? (
        <div className="text-sm">
          <p className="whitespace-pre-line">{textoBio}</p>
          {longa && (
            <Button
              variant="quiet"
              size="sm"
              className="mt-1 px-0"
              onClick={() => setLerMais((v) => !v)}
            >
              {lerMais ? 'ler menos' : 'ler mais'}
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted">Biografia não disponível.</p>
      )}

      {filmes.length > 0 && (
        <div>
          <h5 className="mb-2 text-xs font-bold tracking-wider text-muted uppercase">
            Filmes
          </h5>
          <PosterGrid aria-label="Filmes relacionados">
            {filmes.map((filme) => {
              const poster = imagemTmdb(filme.poster_path, 'w185');
              const ano = anoDe(filme.release_date);
              return (
                <Link
                  key={filme.tmdb_id}
                  to={`/filme/${filme.tmdb_id}`}
                  aria-label={`${filme.title}${ano ? ` (${ano})` : ''}`}
                  className="block aspect-2/3 overflow-hidden rounded-md border border-line bg-surface-2 p-1 text-center text-xs font-semibold text-faint hover:border-accent"
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    filme.title
                  )}
                </Link>
              );
            })}
          </PosterGrid>
        </div>
      )}
    </div>
  );
}

// `pessoa` = { id, name }; renderiza só quando há uma pessoa selecionada.
export function PessoaModal({ pessoa, onClose }) {
  if (!pessoa) return null;
  return (
    <Modal open title={pessoa.name} onClose={onClose}>
      <Conteudo pessoaId={pessoa.id} nome={pessoa.name} />
    </Modal>
  );
}
