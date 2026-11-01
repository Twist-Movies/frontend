import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  SectionTitle,
  Skeleton,
} from '../components/ui';
import { useAuth } from '../auth';
import { listarPlaylists } from '../api/playlists';
import { useAsync } from '../lib/useAsync';

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
          <Link to={`/lista/${lista.id}`} className="block">
            <Card className="flex h-full flex-col gap-2 hover:border-accent">
              <span className="font-bold">{lista.name}</span>
              <div>
                <Badge>{lista.is_public ? 'Pública' : 'Privada'}</Badge>
              </div>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Feed() {
  const { session } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-black">
          Olá, {session?.displayName ?? session?.username}
        </h1>
        <BuscaRapida />
      </section>

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
        <SectionTitle>Atividade e populares</SectionTitle>
        <EmptyState
          title="Em breve"
          description="A atividade de quem você segue e os filmes populares chegam quando o back-end oferecer esses dados."
        />
      </section>
    </div>
  );
}
