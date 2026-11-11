import { useState } from 'react';
import {
  Button,
  Card,
  ErrorState,
  Field,
  Input,
  Modal,
  SectionTitle,
  Skeleton,
  Textarea,
} from '../components/ui';
import { FormAviso } from '../auth/FormAviso';
import { sessaoDoPerfil } from '../auth/perfil';
import { useAuth } from '../auth';
import {
  AVATAR_MAX_MB,
  AVATAR_TIPOS,
  errosDaApiNoFormulario,
} from '../auth/validacao';
import {
  editarMeuPerfil,
  excluirMinhaConta,
  obterMeuPerfil,
} from '../api/users';
import {
  aplicarMascaraData,
  dataParaIso,
  isoParaData,
  validarDataNascimento,
} from '../lib/dataNascimento';
import { useAsync } from '../lib/useAsync';

function validar(dados) {
  const erros = {};
  if (!dados.username.trim()) erros.username = 'Escolha um nome de usuário.';
  if (!dados.email.trim()) erros.email = 'Informe seu e-mail.';
  if (dados.birthDate) {
    const erroData = validarDataNascimento(dados.birthDate);
    if (erroData) erros.birthDate = erroData;
  }
  if (dados.avatar && !AVATAR_TIPOS.includes(dados.avatar.type))
    erros.avatar = 'Formato não suportado. Use JPEG, PNG ou WebP.';
  else if (dados.avatar && dados.avatar.size > AVATAR_MAX_MB * 1024 * 1024)
    erros.avatar = `A imagem deve ter no máximo ${AVATAR_MAX_MB}MB.`;
  return erros;
}

function FormPerfil({ perfil }) {
  const { updateSession, signOut } = useAuth();
  const [dados, setDados] = useState({
    firstName: perfil.first_name ?? '',
    lastName: perfil.last_name ?? '',
    username: perfil.username,
    email: perfil.email,
    birthDate: isoParaData(perfil.birth_date),
    bio: perfil.bio ?? '',
    avatar: null,
    currentPassword: '',
  });
  const emailMudou =
    dados.email.trim().toLowerCase() !== perfil.email.trim().toLowerCase();
  const [erros, setErros] = useState({});
  const [falha, setFalha] = useState(null);
  const [salvo, setSalvo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo, valor) => {
    setDados((d) => ({ ...d, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
    setSalvo(false);
  };

  async function enviar(e) {
    e.preventDefault();
    setFalha(null);
    setSalvo(false);

    const encontrados = validar(dados);
    if (emailMudou && !dados.currentPassword) {
      encontrados.currentPassword =
        'Informe sua senha atual para trocar o e-mail.';
    }
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const atualizado = await editarMeuPerfil({
        ...dados,
        birthDate: dataParaIso(dados.birthDate),
        username: dados.username.trim(),
        email: dados.email.trim(),
        currentPassword: emailMudou ? dados.currentPassword : undefined,
      });
      if (emailMudou) {
        // O back revoga todas as sessões e apaga o cookie: fim de sessão.
        // O RequireAuth leva ao /entrar levando o aviso.
        await signOut({
          remoto: false,
          aviso: 'E-mail alterado. Entre novamente.',
        });
        return;
      }
      updateSession(sessaoDoPerfil(atualizado));
      setDados((d) => ({ ...d, avatar: null }));
      setSalvo(true);
    } catch (erro) {
      const porCampo = errosDaApiNoFormulario(erro.fieldErrors ?? {});
      if (Object.keys(porCampo).length > 0) setErros(porCampo);
      setFalha(erro);
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
    <form className="flex flex-col gap-4" onSubmit={enviar} noValidate>
      <FormAviso erro={falha} />
      {salvo && (
        <p role="status" className="text-sm text-success">
          Perfil atualizado.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {texto('firstName', 'Nome')}
        {texto('lastName', 'Sobrenome')}
      </div>
      {texto('username', 'Nome de usuário')}
      {texto('email', 'E-mail', { type: 'email' })}
      {emailMudou && (
        <Field
          label="Senha atual"
          hint="Necessária para trocar o e-mail. Você precisará entrar de novo."
          error={erros.currentPassword}
        >
          {(id) => (
            <Input
              id={id}
              type="password"
              autoComplete="current-password"
              value={dados.currentPassword}
              invalid={Boolean(erros.currentPassword)}
              onChange={(e) => alterar('currentPassword', e.target.value)}
            />
          )}
        </Field>
      )}
      {texto('birthDate', 'Data de nascimento', {
        inputMode: 'numeric',
        placeholder: 'dd/mm/aaaa',
        maxLength: 10,
        onChange: (e) =>
          alterar('birthDate', aplicarMascaraData(e.target.value)),
      })}

      <Field label="Bio" error={erros.bio}>
        {(id) => (
          <Textarea
            id={id}
            maxLength={500}
            value={dados.bio}
            onChange={(e) => alterar('bio', e.target.value)}
          />
        )}
      </Field>

      <Field
        label="Nova foto de perfil (opcional)"
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
          />
        )}
      </Field>

      <div>
        <Button type="submit" variant="primary" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}

function ExcluirConta({ username }) {
  const { signOut } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [confirmacao, setConfirmacao] = useState('');
  const [senha, setSenha] = useState('');
  const confirmado =
    confirmacao.trim().toLowerCase() === username.toLowerCase() && senha !== '';
  const [falha, setFalha] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function excluir() {
    setEnviando(true);
    setFalha(null);
    try {
      await excluirMinhaConta({ username, password: senha });
      await signOut({ remoto: false });
    } catch (erro) {
      setFalha(erro);
      setEnviando(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3 border-danger">
      <p className="text-sm text-muted">
        Excluir a conta apaga seu perfil, avaliações, resenhas e listas. Não dá
        para desfazer.
      </p>
      <div>
        <Button variant="ghost" onClick={() => setAberto(true)}>
          Excluir minha conta
        </Button>
      </div>

      <Modal
        open={aberto}
        title="Excluir conta"
        onClose={() => setAberto(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={enviando || !confirmado}
              onClick={excluir}
            >
              Excluir definitivamente
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <FormAviso erro={falha} />
          <Field
            label="Confirme seu nome de usuário"
            hint={`Digite seu nome de usuário (${username}); maiúsculas e minúsculas não importam.`}
          >
            {(id) => (
              <Input
                id={id}
                value={confirmacao}
                autoComplete="off"
                onChange={(e) => setConfirmacao(e.target.value)}
              />
            )}
          </Field>
          <Field label="Senha atual" error={falha?.fieldErrors?.password}>
            {(id) => (
              <Input
                id={id}
                type="password"
                autoComplete="current-password"
                value={senha}
                invalid={Boolean(falha?.fieldErrors?.password)}
                onChange={(e) => setSenha(e.target.value)}
              />
            )}
          </Field>
        </div>
      </Modal>
    </Card>
  );
}

export default function Settings() {
  const { data: perfil, error, loading, recarregar } = useAsync(
    obterMeuPerfil,
    [],
  );

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <h1 className="text-3xl font-black">Configurações</h1>

      <section aria-label="Perfil">
        <SectionTitle>Perfil</SectionTitle>
        {error && <ErrorState error={error} onRetry={recarregar} />}
        {loading && !perfil && <Skeleton height={240} />}
        {perfil && <FormPerfil perfil={perfil} />}
      </section>

      {perfil && (
        <section aria-label="Zona de perigo">
          <SectionTitle>Zona de perigo</SectionTitle>
          <ExcluirConta username={perfil.username} />
        </section>
      )}
    </div>
  );
}
