import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Field, Input } from '../components/ui';
import { FormAviso } from '../auth/FormAviso';
import { avaliarSenha } from '../auth/forcaSenha';
import { AuthLayout, FORM } from '../auth/AuthLayout';
import { authService } from '../auth/service';
import { validarRedefinicao } from '../auth/validacao';

const BARRA = {
  fraca: 'bg-danger',
  media: 'bg-star',
  forte: 'bg-success',
};

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState({});
  const [falha, setFalha] = useState(null);
  const [linkInvalido, setLinkInvalido] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const senha = avaliarSenha(password);

  async function enviar(e) {
    e.preventDefault();
    setFalha(null);

    const encontrados = validarRedefinicao({ password, confirmacao });
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await authService().redefinirSenha({ uid, token, password });
      navigate('/entrar', {
        replace: true,
        state: { aviso: 'Senha redefinida. Entre com a nova senha.' },
      });
    } catch (erro) {
      if (erro.fieldErrors?.new_password) {
        setErros({ password: erro.fieldErrors.new_password });
      } else if (erro.status === 400) {
        setLinkInvalido(true);
      } else {
        setFalha(erro);
      }
      setEnviando(false);
    }
  }

  if (linkInvalido) {
    return (
      <AuthLayout
        title="Link inválido"
        subtitle="Este link de redefinição é inválido ou expirou."
        footer={<Link to="/esqueci-senha">Solicitar um novo link</Link>}
      >
        <p
          role="alert"
          className="rounded-lg border border-l-3 border-line border-l-muted bg-surface-2 p-3 text-sm"
        >
          Link inválido ou expirado.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Nova senha"
      subtitle="Escolha uma nova senha para sua conta."
      footer={<Link to="/entrar">Voltar para o login</Link>}
    >
      <form className={FORM} onSubmit={enviar} noValidate>
        <FormAviso erro={falha} />

        <Field label="Nova senha" error={erros.password}>
          {(id) => (
            <Input
              id={id}
              type="password"
              autoComplete="new-password"
              value={password}
              invalid={Boolean(erros.password)}
              onChange={(e) => {
                setPassword(e.target.value);
                setErros((a) => ({ ...a, password: undefined }));
              }}
            />
          )}
        </Field>

        {password.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="h-1 overflow-hidden rounded-full bg-surface-2">
              <div
                data-forca={senha.forca}
                className={`h-full transition-[width] ${BARRA[senha.forca]}`}
                style={{ width: `${senha.percentual}%` }}
              />
            </div>
            <span className="text-sm text-faint" role="status">
              Força da senha: {senha.rotulo}
            </span>
          </div>
        )}

        <Field label="Confirmar nova senha" error={erros.confirmacao}>
          {(id) => (
            <Input
              id={id}
              type="password"
              autoComplete="new-password"
              value={confirmacao}
              invalid={Boolean(erros.confirmacao)}
              onChange={(e) => {
                setConfirmacao(e.target.value);
                setErros((a) => ({ ...a, confirmacao: undefined }));
              }}
            />
          )}
        </Field>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          disabled={enviando}
        >
          {enviando ? 'Salvando…' : 'Redefinir senha'}
        </Button>
      </form>
    </AuthLayout>
  );
}
