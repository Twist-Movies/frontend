import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs';

const items = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'diario', label: 'Diário' },
];

describe('Tabs', () => {
  it('marca apenas a aba ativa', () => {
    render(<Tabs items={items} active="diario" onChange={vi.fn()} />);

    expect(screen.getByRole('tab', { name: 'Diário' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Perfil' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('avisa a troca de aba', async () => {
    const onChange = vi.fn();
    render(<Tabs items={items} active="perfil" onChange={onChange} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Diário' }));

    expect(onChange).toHaveBeenCalledWith('diario');
  });
});
