import { Link } from 'react-router-dom';
import { Avatar, Button, Card } from '../ui';
import { nomeCompleto } from '../../lib/formatar';

export function PessoaCard({ pessoa, seguindo, ocupado, onAlternar, detalhe }) {
  const nome = nomeCompleto(pessoa) || pessoa.username;
  const acao = seguindo ? 'Deixar de seguir' : 'Seguir';
  // O perfil abre com os dados que já temos (o back não consulta por username).
  const perfil = { to: `/u/${pessoa.username}`, state: { pessoa } };

  return (
    <Card className="flex items-center gap-3">
      <Link {...perfil} tabIndex={-1} aria-hidden="true">
        <Avatar name={pessoa.username} src={pessoa.avatar_url} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          {...perfil}
          className="block truncate font-semibold hover:text-accent"
        >
          {nome}
        </Link>
        <p className="truncate text-sm text-faint">@{pessoa.username}</p>
        {detalhe && <p className="text-xs text-muted">{detalhe}</p>}
      </div>
      <Button
        size="sm"
        variant={seguindo ? 'ghost' : 'primary'}
        disabled={ocupado}
        aria-label={`${acao} ${pessoa.username}`}
        onClick={() => onAlternar(pessoa)}
      >
        {acao}
      </Button>
    </Card>
  );
}
