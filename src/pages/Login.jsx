import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Field, Input } from '../components/ui';
import { FormAviso } from '../auth/FormAviso';
import { useAuth } from '../auth';
import { AuthLayout, FORM } from '../auth/AuthLayout';

function validar(email, password) {
  const erros = {};
  if (!email.trim()) erros.email = 'Informe seu e-mail.';
  else if (!/^\S+@\S+\.\S+$/.test(email.trim()))
    erros.email = 'E-mail inválido.';
  if (!password) erros.password = 'Informe sua senha.';
  return erros;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erros, setErros] = useState({});
  const [falha, setFalha] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Devolve o usuário ao destino que ele tentou acessar antes do login.
  const destino = location.state?.from?.pathname ?? '/';

  async function enviar(e) {
    e.preventDefault();
    setFalha(null);

    const encontrados = validar(email, password);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await signIn({ email, password });
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

        <Field label="E-mail" error={erros.email}>
          {(id) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              value={email}
              invalid={Boolean(erros.email)}
              onChange={(e) => {
                setEmail(e.target.value);
                setErros((a) => ({ ...a, email: undefined }));
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

        <p className="rounded-lg border border-dashed border-line bg-surface-2 p-3 text-center text-xs text-muted [&_code]:text-fg">
          Sem back-end ainda. Use <code>davi@twist.app</code> com a senha{' '}
          <code>twist1234</code>.
        </p>
      </form>
    </AuthLayout>
  );
}
