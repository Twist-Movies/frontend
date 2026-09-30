import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Field, Input } from '../components/ui';
import { FormAviso } from '../auth/FormAviso';
import { useAuth } from '../auth';
import { AuthLayout, FORM } from '../auth/AuthLayout';
import { validarLogin } from '../auth/validacao';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [erros, setErros] = useState({});
  const [falha, setFalha] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destino = location.state?.from?.pathname ?? '/';

  async function enviar(e) {
    e.preventDefault();
    setFalha(null);

    const encontrados = validarLogin({ identifier, password });
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await signIn({ identifier, password });
      navigate(destino, { replace: true });
    } catch (erro) {
      setFalha(erro);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Continue de onde você parou."
      footer={
        <>
          Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
        </>
      }
    >
      <form className={FORM} onSubmit={enviar} noValidate>
        <FormAviso erro={falha} />

        <Field label="E-mail ou nome de usuário" error={erros.identifier}>
          {(id) => (
            <Input
              id={id}
              autoComplete="username"
              value={identifier}
              invalid={Boolean(erros.identifier)}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setErros((a) => ({ ...a, identifier: undefined }));
              }}
            />
          )}
        </Field>

        <Field label="Senha" error={erros.password}>
          {(id) => (
            <Input
              id={id}
              type="password"
              autoComplete="current-password"
              value={password}
              invalid={Boolean(erros.password)}
              onChange={(e) => {
                setPassword(e.target.value);
                setErros((a) => ({ ...a, password: undefined }));
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
          {enviando ? 'Entrando…' : 'Entrar'}
        </Button>

        {import.meta.env.VITE_API_MOCK !== 'false' && (
          <p className="rounded-lg border border-dashed border-line bg-surface-2 p-3 text-center text-xs text-muted [&_code]:text-fg">
            Modo de demonstração. Use <code>davi@twist.app</code> (ou{' '}
            <code>davi</code>) com a senha <code>twist1234</code>.
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
