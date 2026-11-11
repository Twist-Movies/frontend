import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
  Tabs,
} from '../components/ui';
import { FormAviso } from '../auth/FormAviso';
import { PessoaCard } from '../components/members/PessoaCard';
import { useAuth } from '../auth';
import {
  buscarUsuarios,
  deixarDeSeguir,
  listarSeguidores,
  listarSeguindo,
  obterMeuPerfil,
  seguirUsuario,
} from '../api/users';
import { todasAsPaginas } from '../lib/paginas';
import { sugerirMembros } from '../lib/sugestoes';
import { useAsync } from '../lib/useAsync';

async function carregarRede(idDaSessao) {
  // Sessões guardadas antes da conexão com a API não têm o id.
  const meuId = idDaSessao ?? (await obterMeuPerfil()).id;
  const [seguindo, seguidores] = await Promise.all([
    todasAsPaginas((pagina) => listarSeguindo(meuId, pagina)),
    todasAsPaginas((pagina) => listarSeguidores(meuId, pagina)),
  ]);
  return { meuId, seguindo, seguidores };
}

const ATRASO_BUSCA_MS = 400;

// Busca de pessoas por username, com debounce. Com o campo vazio, não aparece nada.
function BuscaDePessoas({ termo, onChange, ...comum }) {
  const { session } = useAuth();
  const [consulta, setConsulta] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setConsulta(termo.trim()), ATRASO_BUSCA_MS);
    return () => clearTimeout(id);
  }, [termo]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-xl">
        <Search
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint"
        />
        <Input
          type="search"
          aria-label="Buscar pessoas"
          placeholder="Buscar pessoas por username"
          className="pl-10"
          value={termo}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {termo.trim() && consulta === termo.trim() && (
        <ResultadoDaBusca
          q={consulta}
          meuUsername={session?.username}
          {...comum}
        />
      )}
    </div>
  );
}

function ResultadoDaBusca({
  q,
  meuUsername,
  idsSeguindo,
  ocupadoId,
  onAlternar,
}) {
  const { data, error, loading, recarregar } = useAsync(
    () => buscarUsuarios(q),
    [q],
  );

  if (error) return <ErrorState error={error} onRetry={recarregar} />;
  if (!data) return loading ? <Skeleton height={72} /> : null;

  const pessoas = (data.results ?? []).filter(
    (pessoa) => pessoa.username !== meuUsername,
  );
  if (pessoas.length === 0) {
    return (
      <EmptyState
        title="Ninguém encontrado"
        description={`Nenhum membro com “${q}” no username.`}
      />
    );
  }

  return (
    <ListaDePessoas
      pessoas={pessoas}
      idsSeguindo={idsSeguindo}
      ocupadoId={ocupadoId}
      onAlternar={onAlternar}
    />
  );
}

function Grade({ children }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
  );
}

function Sugestoes({ rede, idsSeguindo, ocupadoId, onAlternar }) {
  const { data, error, loading, recarregar } = useAsync(
    () => sugerirMembros(rede),
    // Só consulta ao abrir a aba; seguir alguém não refaz a busca.
    [rede.meuId],
  );

  if (error) return <ErrorState error={error} onRetry={recarregar} />;
  if (!data) return loading ? <Skeleton height={72} /> : null;

  const visiveis = data.filter(({ pessoa }) => !idsSeguindo.has(pessoa.id));
  if (visiveis.length === 0) {
    return (
      <EmptyState
        title="Sem sugestões por enquanto"
        description="Siga alguns membros e as sugestões aparecem a partir de quem eles seguem."
      />
    );
  }

  return (
    <Grade>
      {visiveis.map(({ pessoa, comuns }) => (
        <li key={pessoa.id}>
          <PessoaCard
            pessoa={pessoa}
            seguindo={false}
            ocupado={ocupadoId === pessoa.id}
            onAlternar={onAlternar}
            detalhe={`${comuns} ${comuns === 1 ? 'conexão em comum' : 'conexões em comum'}`}
          />
        </li>
      ))}
    </Grade>
  );
}

function ListaDePessoas({
  pessoas,
  idsSeguindo,
  ocupadoId,
  onAlternar,
  vazio,
}) {
  if (pessoas.length === 0) return <EmptyState {...vazio} />;

  return (
    <Grade>
      {pessoas.map((pessoa) => (
        <li key={pessoa.id}>
          <PessoaCard
            pessoa={pessoa}
            seguindo={idsSeguindo.has(pessoa.id)}
            ocupado={ocupadoId === pessoa.id}
            onAlternar={onAlternar}
          />
        </li>
      ))}
    </Grade>
  );
}

function Rede() {
  const { session } = useAuth();
  const [aba, setAba] = useState('seguindo');
  const [busca, setBusca] = useState('');
  const [ocupadoId, setOcupadoId] = useState(null);
  const [falha, setFalha] = useState(null);
  const {
    data: rede,
    error,
    loading,
    recarregar,
    definir,
  } = useAsync(() => carregarRede(session?.id), [session?.id]);

  if (error) return <ErrorState error={error} onRetry={recarregar} />;
  if (!rede) return loading ? <Skeleton height={120} /> : null;

  const idsSeguindo = new Set(rede.seguindo.map((pessoa) => pessoa.id));

  async function alternar(pessoa) {
    const jaSigo = idsSeguindo.has(pessoa.id);
    setOcupadoId(pessoa.id);
    setFalha(null);
    try {
      if (jaSigo) await deixarDeSeguir(pessoa.id);
      else await seguirUsuario(pessoa.id);
      definir({
        ...rede,
        seguindo: jaSigo
          ? rede.seguindo.filter((p) => p.id !== pessoa.id)
          : [pessoa, ...rede.seguindo],
      });
    } catch (e) {
      setFalha(e);
    } finally {
      setOcupadoId(null);
    }
  }

  const comum = { idsSeguindo, ocupadoId, onAlternar: alternar };

  const buscando = busca.trim() !== '';

  return (
    <>
      <BuscaDePessoas termo={busca} onChange={setBusca} {...comum} />

      {!buscando && (
        <Tabs
          active={aba}
          onChange={setAba}
          items={[
            { id: 'seguindo', label: `Seguindo (${rede.seguindo.length})` },
            {
              id: 'seguidores',
              label: `Seguidores (${rede.seguidores.length})`,
            },
            { id: 'sugestoes', label: 'Sugestões' },
          ]}
        />
      )}

      <FormAviso erro={falha} />

      {!buscando && aba === 'seguindo' && (
        <ListaDePessoas
          pessoas={rede.seguindo}
          vazio={{
            title: 'Você ainda não segue ninguém',
            description: 'Veja as sugestões para encontrar membros.',
          }}
          {...comum}
        />
      )}
      {!buscando && aba === 'seguidores' && (
        <ListaDePessoas
          pessoas={rede.seguidores}
          vazio={{
            title: 'Ninguém segue você ainda',
            description:
              'Avalie filmes e escreva comentários para ser descoberto.',
          }}
          {...comum}
        />
      )}
      {!buscando && aba === 'sugestoes' && <Sugestoes rede={rede} {...comum} />}
    </>
  );
}

export default function Members() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="mb-4 text-3xl font-black">Membros</h1>
      <Rede />
    </div>
  );
}
