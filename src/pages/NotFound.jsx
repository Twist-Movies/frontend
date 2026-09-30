import { Link } from 'react-router-dom';
import { Button, EmptyState } from '../components/ui';

export default function NotFound() {
  return (
    <EmptyState
      title="Esta página não existe"
      description="O endereço acessado não corresponde a nenhuma tela do TWIST."
      action={
        <Link to="/">
          <Button variant="primary">Voltar ao início</Button>
        </Link>
      }
    />
  );
}
