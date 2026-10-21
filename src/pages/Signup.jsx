import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Field, Input } from '../components/ui';
import { FormAviso } from '../auth/FormAviso';
import { avaliarSenha } from '../auth/forcaSenha';
import { useAuth } from '../auth';
import { AuthLayout, FORM } from '../auth/AuthLayout';
import {
  AVATAR_MAX_MB,
  AVATAR_TIPOS,
  errosDaApiNoFormulario,
  validarCadastro,
} from '../auth/validacao';

const BARRA = {
  fraca: 'bg-danger',
  media: 'bg-star',
  forte: 'bg-success',
};

const VAZIO = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  birthDate: '',
  password: '',
  avatar: null,
};

export default function Signup() {
  const [dados, setDados] = useState(VAZIO);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [erros, setErros] = useState({});
  const [falha, setFalha] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const senha = avaliarSenha(dados.password);

  function alterar(campo, valor) {
    setDados((d) => ({ ...d, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  }

  async function enviar(e) {
    e.preventDefault();
    setFalha(null);

    const encontrados = validarCadastro(dados);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await signUp(dados);
      navigate('/', { replace: true });
    } catch (erro) {
      const porCampo = errosDaApiNoFormulario(erro.fieldErrors ?? {});
      if (Object.keys(porCampo).length > 0) setErros(porCampo);
      else setFalha(erro);
    } finally {
      setEnviando(false);
    }
  }

  const texto = (campo, rotulo, props = {}) => (
    <Field label={rotulo} error={erros[campo]}>
      {(id) => (
        <Input
          id={id}
          value={dados[campo]}
          invalid={Boolean(erros[campo])}
          onChange={(e) => alterar(campo, e.target.value)}
          {...props}
        />
      )}
    </Field>
  );

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

        <div className="grid gap-4 sm:grid-cols-2">
          {texto('firstName', 'Nome', { autoComplete: 'given-name' })}
          {texto('lastName', 'Sobrenome', { autoComplete: 'family-name' })}
        </div>

        {texto('username', 'Nome de usuário', { autoComplete: 'username' })}
        {texto('email', 'E-mail', { type: 'email', autoComplete: 'email' })}
        {texto('birthDate', 'Data de nascimento', {
          type: 'date',
          autoComplete: 'bday',
        })}
        {texto('password', 'Senha', {
          type: 'password',
          autoComplete: 'new-password',
        })}

        {dados.password.length > 0 && (
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

        <Field
          label="Foto de perfil (opcional)"
          hint={`JPEG, PNG ou WebP, até ${AVATAR_MAX_MB}MB.`}
          error={erros.avatar}
        >
          {(id) => (
            <Input
              id={id}
              type="file"
              accept={AVATAR_TIPOS.join(',')}
              invalid={Boolean(erros.avatar)}
              onChange={(e) => alterar('avatar', e.target.files?.[0] ?? null)}
              className="file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-surface-hover file:px-3 file:py-1 file:text-fg"
            />
          )}
        </Field>

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
