import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Field, Input } from '../components/ui';
import { FormAviso } from '../auth/FormAviso';
import { AuthLayout, FORM } from '../auth/AuthLayout';
import { authService } from '../auth/service';
import { validarRecuperacao } from '../auth/validacao';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [erros, setErros] = useState({});
  const [falha, setFalha] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setFalha(null);

    const encontrados = validarRecuperacao({ email });
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await authService().solicitarRecuperacaoSenha(email);
      setEnviado(true);
    } catch (erro) {
      setFalha(erro);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      title="Esqueci minha senha"
      subtitle="Informe seu e-mail para receber o link de redefinição."
      footer={
        <>
          Lembrou a senha? <Link to="/entrar">Entrar</Link>
        </>
      }
    >
      {enviado ? (
        <p
          role="status"
          className="rounded-lg border border-line bg-surface-2 p-3 text-sm"
        >
          Se existir uma conta com esse e-mail, enviamos um link para redefinir
          a senha. Confira também a caixa de spam.
        </p>
      ) : (
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
                  setErros({});
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
            {enviando ? 'Enviando…' : 'Enviar link'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
