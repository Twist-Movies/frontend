import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '../auth';
import Signup from './Signup';

function Sonda() {
  return <span data-testid="rota">{useLocation().pathname}</span>;
}

function montar() {
  render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <AuthProvider sessaoInicial={null}>
        <Routes>
          <Route path="/cadastro" element={<Signup />} />
          <Route path="*" element={<Sonda />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

const botao = () => screen.getByRole('button', { name: /Criar conta/ });
const aceitarTermos = () => userEvent.click(screen.getByRole('checkbox'));
const campo = (rotulo) => screen.getByLabelText(rotulo);

async function preencherValido(
  sufixo = Math.random().toString(36).slice(2, 8),
) {
  await userEvent.type(campo('Nome'), 'Bia');
  await userEvent.type(campo('Sobrenome'), 'Souza');
  await userEvent.type(campo('Nome de usuário'), `bia_${sufixo}`);
  await userEvent.type(campo('E-mail'), `bia_${sufixo}@twist.app`);
  await userEvent.type(campo('Data de nascimento'), '2001-02-03');
  await userEvent.type(campo('Senha'), 'senhaforte1');
}

describe('Signup', () => {
  beforeEach(() => localStorage.clear());

  it('só libera o envio depois do aceite dos termos', async () => {
    montar();

    expect(botao()).toBeDisabled();
    await aceitarTermos();
    expect(botao()).toBeEnabled();
  });

  it('cobra todos os campos obrigatórios da spec', async () => {
    montar();
    await aceitarTermos();

    await userEvent.click(botao());

    for (const mensagem of [
      'Informe seu nome.',
      'Informe seu sobrenome.',
      'Escolha um nome de usuário.',
      'Informe seu e-mail.',
      'Informe sua data de nascimento.',
      'Escolha uma senha.',
    ]) {
      expect(screen.getByText(mensagem)).toBeInTheDocument();
    }
  });

  it('limpa o erro do campo assim que o usuário corrige', async () => {
    montar();
    await aceitarTermos();
    await userEvent.click(botao());

    await userEvent.type(campo('Nome'), 'B');

    expect(screen.queryByText('Informe seu nome.')).not.toBeInTheDocument();
  });

  it('mostra a força da senha enquanto digita', async () => {
    montar();

    await userEvent.type(campo('Senha'), 'abc');

    expect(screen.getByRole('status')).toHaveTextContent(
      'Força da senha: Fraca',
    );
  });

  it('recusa foto em formato não suportado', async () => {
    montar();
    await preencherValido();
    await userEvent.upload(
      campo('Foto de perfil (opcional)'),
      new File(['x'], 'eu.gif', { type: 'image/gif' }),
      { applyAccept: false },
    );
    await aceitarTermos();

    await userEvent.click(botao());

    expect(
      screen.getByText('Formato não suportado. Use JPEG, PNG ou WebP.'),
    ).toBeInTheDocument();
  });

  it('cria a conta e leva para o início', async () => {
    montar();
    await preencherValido();
    await userEvent.upload(
      campo('Foto de perfil (opcional)'),
      new File(['x'], 'eu.png', { type: 'image/png' }),
    );
    await aceitarTermos();

    await userEvent.click(botao());

    await waitFor(() =>
      expect(screen.getByTestId('rota')).toHaveTextContent('/'),
    );
  });

  it('põe no campo certo o erro devolvido pela API', async () => {
    montar();
    await preencherValido();
    await userEvent.clear(campo('Nome de usuário'));
    await userEvent.type(campo('Nome de usuário'), 'davi');
    await aceitarTermos();

    await userEvent.click(botao());

    expect(
      await screen.findByText('Este nome de usuário já existe.'),
    ).toBeInTheDocument();
    expect(campo('Nome de usuário')).toHaveAttribute('aria-invalid', 'true');
  });

  describe('falha sem erro por campo', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
    });

    it('mostra o aviso geral de falha de sistema', async () => {
      vi.stubEnv('VITE_API_MOCK', 'false');
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new TypeError('offline')),
      );
      montar();
      await preencherValido();
      await aceitarTermos();

      await userEvent.click(botao());

      const aviso = await screen.findByRole('alert');
      expect(aviso).toHaveTextContent(/Sem conexão/);
      expect(aviso).toHaveAttribute('data-tone', 'servidor');
    });
  });

  it('oferece o caminho para o login', () => {
    montar();

    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
      'href',
      '/entrar',
    );
  });
});
