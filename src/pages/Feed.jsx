import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  SectionTitle,
  Skeleton,
} from '../components/ui';
import { PosterRow, PosterRowSkeleton } from '../components/ui/PosterRow';
import { ListaCard } from '../components/lists/ListaCard';
import { useAuth } from '../auth';
import { descobrirFilmes, filmesEmAlta } from '../api/discover';
import { listarFeed } from '../api/feed';
import { listarPlaylists } from '../api/playlists';
import { useAsync } from '../lib/useAsync';
import { formatarData } from '../lib/formatar';
import { anoDe, imagemTmdb } from '../lib/tmdbImage';

function BuscaRapida() {
  const [termo, setTermo] = useState('');
  const navigate = useNavigate();

  function buscar(e) {
    e.preventDefault();
    const q = termo.trim();
    if (q) navigate(`/busca?q=${encodeURIComponent(q)}`);
  }

  return (
    <form role="search" className="flex max-w-xl gap-2" onSubmit={buscar}>
      <Input
        type="search"
        aria-label="Buscar filme"
        placeholder="O que você quer assistir?"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
      />
      <Button type="submit" variant="primary">
        Buscar
      </Button>
    </form>
  );
}

function Destaque({ filme }) {
  const fundo = imagemTmdb(filme.backdrop_path, 'w1280');
  const ano = anoDe(filme.release_date);

  return (
    <section
      aria-label="Destaque"
      className="relative isolate overflow-hidden rounded-2xl border border-line bg-surface-2"
    >
      {fundo && (
        <img
          src={fundo}
          alt=""
          className="absolute inset-0 -z-10 size-full object-cover"
        />
      )}
      <div
        className={
          fundo
            ? 'bg-linear-to-t from-black/90 via-black/50 to-black/10'
            : 'bg-linear-to-br from-surface-2 to-surface'
        }
      >
        <div className="flex min-h-56 flex-col justify-end gap-2 p-5 sm:min-h-72 sm:p-8 lg:min-h-80">
          <span className="text-xs font-bold tracking-wider text-star uppercase">
            Em destaque
          </span>
          <h2
            className={`max-w-2xl text-2xl font-black sm:text-4xl ${fundo ? 'text-white' : ''}`}
          >
            {filme.title}
            {ano && <span className="font-normal opacity-70"> ({ano})</span>}
          </h2>
          {filme.overview && (
            <p
              className={`line-clamp-2 max-w-2xl text-sm sm:line-clamp-3 sm:text-base ${fundo ? 'text-white/85' : 'text-muted'}`}
            >
              {filme.overview}
            </p>
          )}
          <div className="mt-2">
            <Link to={`/filme/${filme.tmdb_id}`}>
              <Button variant="primary">Ver detalhes</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Fileira do catálogo: em erro ou sem itens, a seção some.
function Fileira({ titulo, estado }) {
  const { data, error, loading } = estado;
  if (error) return null;
  if (!data) return loading ? <PosterRowSkeleton title={titulo} /> : null;
  const filmes = data.results ?? [];
  if (filmes.length === 0) return null;
  return <PosterRow title={titulo} filmes={filmes} />;
}

function FileiraDoCatalogo({ titulo, sort }) {
  const estado = useAsync(() => descobrirFilmes({ sort }), [sort]);
  return <Fileira titulo={titulo} estado={estado} />;
}

function EmAlta() {
  const estado = useAsync(() => filmesEmAlta(), []);
  return <Fileira titulo="Em alta nesta semana" estado={estado} />;
}

function SuasListas() {
  const { data, error, loading, recarregar } = useAsync(
    () => listarPlaylists(1),
    [],
  );

  if (error) return <ErrorState error={error} onRetry={recarregar} />;
  if (!data) return loading ? <Skeleton height={80} /> : null;

  if (data.results.length === 0) {
    return (
      <EmptyState
        title="Você ainda não criou nenhuma lista"
        action={
          <Link to="/listas" className="text-accent">
            Criar minha primeira lista
          </Link>
        }
      />
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.results.slice(0, 4).map((lista) => (
        <li key={lista.id}>
          <ListaCard lista={lista} mostrarDescricao={false} />
        </li>
      ))}
    </ul>
  );
}

function ConvidarASeguir() {
  return (
    <EmptyState
      title="Nada por aqui ainda"
      description="Siga outras pessoas para ver o que elas andam assistindo e escrevendo."
      action={
        <Link to="/membros" className="text-accent">
          Encontrar pessoas para seguir
        </Link>
      }
    />
  );
}

function Atividade() {
  const { data, error, loading } = useAsync(() => listarFeed(1), []);

  // O feed é um complemento: se falhar, a página segue sem alarde.
  if (error) return <ConvidarASeguir />;
  if (!data) return loading ? <Skeleton height={80} /> : null;

  const resenhas = data.results ?? [];
  if (resenhas.length === 0) return <ConvidarASeguir />;

  return (
    <ul className="flex flex-col gap-3">
      {resenhas.slice(0, 5).map((resenha) => {
        const filme = resenha.movie ?? resenha;
        const tmdbId = filme.tmdb_id ?? resenha.movie_tmdb_id;
        const autor = resenha.author?.username ?? '';
        return (
          <li key={resenha.id}>
            <Card className="flex items-start gap-3">
              <Link to={`/u/${autor}`} tabIndex={-1} aria-hidden="true">
                <Avatar name={autor || '?'} src={resenha.author?.avatar_url} />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-sm">
                  <Link
                    to={`/u/${autor}`}
                    className="font-bold hover:text-accent"
                  >
                    {autor}
                  </Link>{' '}
                  <span className="text-muted">escreveu sobre</span>{' '}
                  <Link
                    to={`/filme/${tmdbId}`}
                    className="font-bold hover:text-accent"
                  >
                    {filme.title}
                  </Link>
                </p>
                <p className="line-clamp-3 text-sm break-words text-muted">
                  {resenha.contains_spoiler
                    ? 'Contém spoilers.'
                    : resenha.content}
                </p>
                <Link
                  to={`/comentario/${resenha.id}`}
                  className="text-xs text-faint hover:text-fg"
                >
                  {formatarData(resenha.created_at) || 'Ver comentário'}
                </Link>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

export default function Feed() {
  const { session } = useAuth();
  const populares = useAsync(() => descobrirFilmes({ sort: 'popularity' }), []);
  const destaque = populares.data?.results?.[0];

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-black">
          Olá, {session?.displayName ?? session?.username}
        </h1>
        <BuscaRapida />
      </section>

      {destaque && <Destaque filme={destaque} />}

      <Fileira titulo="Destaques do momento" estado={populares} />
      <FileiraDoCatalogo titulo="Lançamentos" sort="release_date" />
      <FileiraDoCatalogo titulo="Mais bem avaliados" sort="rating" />
      <EmAlta />

      <section aria-label="Suas listas">
        <SectionTitle
          action={
            <Link to="/listas" className="text-faint normal-case hover:text-fg">
              ver todas
            </Link>
          }
        >
          Suas listas
        </SectionTitle>
        <SuasListas />
      </section>

      <section aria-label="Atividade">
        <SectionTitle>Atividade de quem você segue</SectionTitle>
        <Atividade />
      </section>
    </div>
  );
}
