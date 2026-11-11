import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
  Tabs,
} from '../components/ui';
import { FormAviso } from '../auth/FormAviso';
import { useAuth } from '../auth';
import {
  deixarDeSeguir,
  listarSeguidores,
  listarSeguindo,
  obterMeuPerfil,
  seguirUsuario,
} from '../api/users';
import { useAsync } from '../lib/useAsync';
import { nomeCompleto } from '../lib/formatar';
import { carregarPerfilPublico } from '../lib/perfilPublico';

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
              state={{ pessoa }}
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

      <Conexoes seguidores={seguidores} seguindo={seguindo} />
    </div>
  );
}

function Conexoes({ seguidores, seguindo }) {
  const [aba, setAba] = useState('seguidores');

  return (
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
  );
}

function PerfilPublico({ username, pessoaConhecida }) {
  const { session } = useAuth();
  const [ocupado, setOcupado] = useState(false);
  const [falha, setFalha] = useState(null);
  const { data, error, loading, recarregar, definir } = useAsync(
    () => carregarPerfilPublico({ username, pessoaConhecida, meuId: session?.id }),
    [username, session?.id],
  );

  if (error) return <ErrorState error={error} onRetry={recarregar} />;
  if (!data) {
    if (loading) return <Skeleton height={120} />;
    return (
      <EmptyState
        title={`Perfil de @${username}`}
        description="Este perfil só abre a partir de um comentário ou das suas conexões."
        action={
          <Link to="/membros" className="text-accent">
            Ver membros
          </Link>
        }
      />
    );
  }

  const { pessoa, seguidores, seguindo, euSigo } = data;

  async function alternar() {
    setOcupado(true);
    setFalha(null);
    try {
      if (euSigo) await deixarDeSeguir(pessoa.id);
      else await seguirUsuario(pessoa.id);
      // Atualiza a tela na hora e confirma com o servidor em seguida.
      definir({
        ...data,
        euSigo: !euSigo,
        seguidores: { ...seguidores, count: seguidores.count + (euSigo ? -1 : 1) },
      });
      recarregar();
    } catch (e) {
      setFalha(e);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-wrap items-center gap-4">
        <Avatar name={pessoa.username} src={pessoa.avatar_url} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-2xl font-black">
            {nomeCompleto(pessoa) || pessoa.username}
          </h1>
          <span className="text-sm text-faint">@{pessoa.username}</span>
        </div>
        <Button
          variant={euSigo ? 'ghost' : 'primary'}
          disabled={ocupado}
          aria-label={`${euSigo ? 'Deixar de seguir' : 'Seguir'} ${pessoa.username}`}
          onClick={alternar}
        >
          {euSigo ? 'Deixar de seguir' : 'Seguir'}
        </Button>
      </Card>

      <FormAviso erro={falha} />
      <Conexoes seguidores={seguidores} seguindo={seguindo} />
    </div>
  );
}

export default function Profile() {
  const { username } = useParams();
  const { state } = useLocation();
  const { session } = useAuth();

  if (session?.username?.toLowerCase() === username.toLowerCase()) {
    return <MeuPerfil />;
  }

  return (
    <PerfilPublico
      key={username}
      username={username}
      pessoaConhecida={state?.pessoa}
    />
  );
}
