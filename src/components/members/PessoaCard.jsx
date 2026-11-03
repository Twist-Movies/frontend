import { Avatar, Button, Card } from '../ui';
import { nomeCompleto } from '../../lib/formatar';

export function PessoaCard({ pessoa, seguindo, ocupado, onAlternar, detalhe }) {
  const nome = nomeCompleto(pessoa) || pessoa.username;
  const acao = seguindo ? 'Deixar de seguir' : 'Seguir';

  return (
    <Card className="flex items-center gap-3">
      <Avatar name={pessoa.username} src={pessoa.avatar_url} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{nome}</p>
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
