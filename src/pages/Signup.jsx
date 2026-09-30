import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Field, Input } from '../components/ui';
import { FormAviso } from '../auth/FormAviso';
import { avaliarSenha } from '../auth/forcaSenha';
import { isUsernameAvailable } from '../auth/session';
import { useAuth } from '../auth';
import { AuthLayout, FORM } from '../auth/AuthLayout';

const BARRA = {
  fraca: 'bg-danger',
  media: 'bg-star',
  forte: 'bg-success',
};

function validar(username, email, password) {
  const erros = {};

  const usuario = username.trim();
  if (!usuario) erros.username = 'Escolha um nome de usuário.';
  else if (usuario.length < 3) erros.username = 'Mínimo de 3 caracteres.';
  else if (!/^[a-zA-Z0-9_]+$/.test(usuario))
    erros.username = 'Use apenas letras, números e underscore.';

  if (!email.trim()) erros.email = 'Informe seu e-mail.';
  else if (!/^\S+@\S+\.\S+$/.test(email.trim()))
    erros.email = 'E-mail inválido.';

  if (!password) erros.password = 'Escolha uma senha.';
  else if (password.length < 8) erros.password = 'Mínimo de 8 caracteres.';

  return erros;
}

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [erros, setErros] = useState({});
  const [falha, setFalha] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [consulta, setConsulta] = useState(null);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const senha = avaliarSenha(password);

  const usuario = username.trim();

  // Derivado durante o render, e não guardado em estado: assim a resposta
  // de uma consulta antiga nunca fica exibida para um nome já alterado.
  const disponivel =
    usuario.length >= 3 && consulta?.username === usuario
      ? consulta.livre
      : null;

  // Consulta de disponibilidade enquanto digita, com espera para não
  // disparar uma requisição por tecla.
  useEffect(() => {
    const alvo = username.trim();
    if (alvo.length < 3) return;

    let cancelado = false;
    const timer = setTimeout(() => {
      isUsernameAvailable(alvo)
        .then((livre) => {
          if (!cancelado) setConsulta({ username: alvo, livre });
        })
        .catch(() => {
          // Falha na consulta não bloqueia o cadastro: a API decide no envio.
        });
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [username]);

  async function enviar(e) {
    e.preventDefault();
    setFalha(null);

    const encontrados = validar(username, email, password);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await signUp({ username, email, password });
      navigate('/', { replace: true });
    } catch (erro) {
      setFalha(erro);
    } finally {
      setEnviando(false);
    }
  }

  const dicaUsuario =
    disponivel === null
      ? undefined
      : disponivel
        ? 'Nome disponível.'
        : 'Este nome já está em uso.';

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Registre o que você assiste e acompanhe seus amigos."
      footer={
        <>
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </>
      }
    >
      <form className={FORM} onSubmit={enviar} noValidate>
        <FormAviso erro={falha} />

        <Field
          label="Nome de usuário"
          error={
            erros.username ?? (disponivel === false ? dicaUsuario : undefined)
          }
          hint={disponivel === true ? dicaUsuario : undefined}
        >
          {(id) => (
            <Input
              id={id}
              autoComplete="username"
              value={username}
              invalid={Boolean(erros.username) || disponivel === false}
              onChange={(e) => {
                setUsername(e.target.value);
                setErros((a) => ({ ...a, username: undefined }));
              }}
            />
          )}
        </Field>

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

        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            className="mt-0.75 flex-none"
            checked={aceitouTermos}
            onChange={(e) => setAceitouTermos(e.target.checked)}
          />
          <span>Li e aceito os termos de uso e a política de privacidade.</span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          disabled={enviando || !aceitouTermos}
        >
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
    </AuthLayout>
  );
}
