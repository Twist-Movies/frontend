import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listarSeguindo } from '../api/users';
import { sugerirMembros } from './sugestoes';

vi.mock('../api/users', () => ({ listarSeguindo: vi.fn() }));

const p = (id, username) => ({
  id,
  username,
  first_name: '',
  last_name: '',
  avatar_url: null,
});
const pagina = (...pessoas) => ({ results: pessoas, next: null });

beforeEach(() => vi.clearAllMocks());

describe('sugerirMembros', () => {
  it('sugere quem a rede segue, sem eu mesmo nem quem já sigo', async () => {
    const seguindo = [p(2, 'ana'), p(3, 'bia')];
    listarSeguindo.mockImplementation(async (id) =>
      id === 2
        ? pagina(p(10, 'caio'), p(11, 'dani'), p(1, 'eu'), p(3, 'bia'))
        : pagina(p(10, 'caio')),
    );

    const sugestoes = await sugerirMembros({
      meuId: 1,
      seguindo,
      seguidores: [],
    });

    expect(sugestoes).toEqual([
      { pessoa: p(10, 'caio'), comuns: 2 },
      { pessoa: p(11, 'dani'), comuns: 1 },
    ]);
  });

  it('desempata por nome de usuário', async () => {
    listarSeguindo.mockResolvedValue(pagina(p(12, 'zeca'), p(11, 'ari')));

    const sugestoes = await sugerirMembros({
      meuId: 1,
      seguindo: [p(2, 'ana')],
      seguidores: [],
    });

    expect(sugestoes.map((s) => s.pessoa.username)).toEqual(['ari', 'zeca']);
  });

  it('usa a rede de quem segue o usuário quando ele não segue ninguém', async () => {
    listarSeguindo.mockResolvedValue(pagina(p(10, 'caio')));

    const sugestoes = await sugerirMembros({
      meuId: 1,
      seguindo: [],
      seguidores: [p(5, 'eva')],
    });

    expect(listarSeguindo).toHaveBeenCalledWith(5);
    expect(sugestoes).toHaveLength(1);
  });

  it('devolve vazio sem consultar quando não há rede', async () => {
    await expect(
      sugerirMembros({ meuId: 1, seguindo: [], seguidores: [] }),
    ).resolves.toEqual([]);
    expect(listarSeguindo).not.toHaveBeenCalled();
  });

  it('limita as fontes consultadas e o total sugerido', async () => {
    const seguindo = Array.from({ length: 12 }, (_, i) => p(100 + i, `u${i}`));
    listarSeguindo.mockImplementation(async (id) =>
      pagina(p(id + 1000, `s${id}`)),
    );

    const sugestoes = await sugerirMembros({
      meuId: 1,
      seguindo,
      seguidores: [],
      fontes: 5,
      limite: 3,
    });

    expect(listarSeguindo).toHaveBeenCalledTimes(5);
    expect(sugestoes).toHaveLength(3);
  });

  it('ignora falhas isoladas', async () => {
    listarSeguindo.mockImplementation(async (id) => {
      if (id === 2) throw new Error('x');
      return pagina(p(10, 'caio'));
    });

    const sugestoes = await sugerirMembros({
      meuId: 1,
      seguindo: [p(2, 'ana'), p(3, 'bia')],
      seguidores: [],
    });

    expect(sugestoes).toHaveLength(1);
  });

  it('repassa o erro quando todas as consultas falham', async () => {
    listarSeguindo.mockRejectedValue(new Error('sem conexão'));

    await expect(
      sugerirMembros({ meuId: 1, seguindo: [p(2, 'ana')], seguidores: [] }),
    ).rejects.toThrow('sem conexão');
  });
});
