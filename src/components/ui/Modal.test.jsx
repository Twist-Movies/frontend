import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

const noop = () => {};

describe('Modal', () => {
  it('não renderiza nada quando fechado', () => {
    render(
      <Modal open={false} title="Registrar filme" onClose={noop}>
        conteúdo
      </Modal>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza como diálogo modal rotulado', () => {
    render(
      <Modal open title="Registrar filme" onClose={noop}>
        conteúdo
      </Modal>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Registrar filme' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('conteúdo')).toBeInTheDocument();
  });

  it('fecha pelo botão de fechar', async () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Registrar filme" onClose={onClose}>
        x
      </Modal>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('fecha com Escape', async () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Registrar filme" onClose={onClose}>
        x
      </Modal>,
    );

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('fecha ao clicar no fundo, mas não ao clicar no painel', async () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Registrar filme" onClose={onClose}>
        conteúdo
      </Modal>,
    );

    await userEvent.click(screen.getByText('conteúdo'));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('trava o scroll do fundo enquanto aberto e devolve ao fechar', () => {
    const { unmount } = render(
      <Modal open title="Registrar filme" onClose={noop}>
        x
      </Modal>,
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('renderiza o rodapé quando fornecido', () => {
    render(
      <Modal open title="t" onClose={noop} footer={<button>Salvar</button>}>
        x
      </Modal>,
    );

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });
});
