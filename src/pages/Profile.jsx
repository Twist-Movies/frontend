import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
  Tabs,
} from '../components/ui';
import { useAuth } from '../auth';
import {
  listarSeguidores,
  listarSeguindo,
  obterMeuPerfil,
} from '../api/users';
import { useAsync } from '../lib/useAsync';
import { nomeCompleto } from '../lib/formatar';

async function carregarPerfil() {
  const perfil = await obterMeuPerfil();
  const [seguidores, seguindo] = await Promise.all([
    listarSeguidores(perfil.id),
    listarSeguindo(perfil.id),
  ]);
  return { perfil, seguidores, seguindo };
}

function Pessoas({ pagina }) {
  if (pagina.results.length === 0) {
    return <EmptyState title="Ninguém por aqui ainda" />;
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {pagina.results.map((pessoa) => (
          <li key={pessoa.id}>
            <Link
              to={`/u/${pessoa.username}`}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface-2"
            >
              <Avatar name={pessoa.username} src={pessoa.avatar_url} />
              <span className="font-semibold">
                {nomeCompleto(pessoa) || pessoa.username}
              </span>
              <span className="text-sm text-faint">@{pessoa.username}</span>
            </Link>
          </li>
        ))}
      </ul>
      {pagina.count > pagina.results.length && (
        <p className="text-sm text-faint">
          Mostrando {pagina.results.length} de {pagina.count}.
        </p>
      )}
    </div>
  );
}

function MeuPerfil() {
  const [aba, setAba] = useState('seguidores');
  const { data, error, loading, recarregar } = useAsync(carregarPerfil, []);

  if (error) return <ErrorState error={error} onRetry={recarregar} />;
  if (!data) return loading ? <Skeleton height={120} /> : null;

  const { perfil, seguidores, seguindo } = data;

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-wrap items-center gap-4">
        <Avatar name={perfil.username} src={perfil.avatar_url} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-2xl font-black">
            {nomeCompleto(perfil) || perfil.username}
          </h1>
          <span className="text-sm text-faint">@{perfil.username}</span>
          {perfil.bio && <p className="mt-1 max-w-prose">{perfil.bio}</p>}
        </div>
        <div className="flex gap-2">
          <Link to="/configuracoes">
            <Button size="sm">Editar perfil</Button>
          </Link>
          <Link to="/listas">
            <Button size="sm" variant="ghost">
              Minhas listas
            </Button>
          </Link>
        </div>
      </Card>

      <section aria-label="Conexões">
        <Tabs
          active={aba}
          onChange={setAba}
          items={[
            { id: 'seguidores', label: `Seguidores (${seguidores.count})` },
            { id: 'seguindo', label: `Seguindo (${seguindo.count})` },
          ]}
        />
        <Pessoas pagina={aba === 'seguidores' ? seguidores : seguindo} />
      </section>
    </div>
  );
}

export default function Profile() {
  const { username } = useParams();
  const { session } = useAuth();

  // O back ainda não tem consulta de perfil por username: só o próprio.
  if (session?.username?.toLowerCase() !== username.toLowerCase()) {
    return (
      <EmptyState
        title={`Perfil de @${username}`}
        description="Os perfis de outros membros ainda não estão disponíveis."
        action={
          <Link to="/" className="text-accent">
            Voltar ao início
          </Link>
        }
      />
    );
  }

  return <MeuPerfil />;
}
