import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listarSeguidores, listarSeguindo, obterMeuPerfil } from '../api/users';
import { carregarPerfilPublico } from './perfilPublico';

vi.mock('../api/users', () => ({
  obterMeuPerfil: vi.fn(),
  listarSeguindo: vi.fn(),
  listarSeguidores: vi.fn(),
}));

const p = (id, username) => ({
  id,
  username,
  first_name: '',
  last_name: '',
  avatar_url: null,
});
const pagina = (...pessoas) => ({
  count: pessoas.length,
  results: pessoas,
  next: null,
});
const ANA = p(5, 'ana');
const BIA = p(6, 'bia');

let meuSeguindo;
let meusSeguidores;

beforeEach(() => {
  vi.clearAllMocks();
  meuSeguindo = [];
  meusSeguidores = [];
  obterMeuPerfil.mockResolvedValue({ id: 4 });
  listarSeguindo.mockImplementation(async (id) =>
    id === 4 ? pagina(...meuSeguindo) : pagina(BIA),
  );
  listarSeguidores.mockImplementation(async (id) =>
    id === 4 ? pagina(...meusSeguidores) : pagina(BIA, p(7, 'caio')),
  );
});

describe('carregarPerfilPublico', () => {
  it('usa a pessoa conhecida e carrega as conexões dela', async () => {
    const dados = await carregarPerfilPublico({
      username: 'ana',
      pessoaConhecida: ANA,
      meuId: 4,
    });

    expect(dados.pessoa).toBe(ANA);
    expect(dados.euSigo).toBe(false);
    expect(dados.seguidores.count).toBe(2);
    expect(dados.seguindo.count).toBe(1);
    expect(listarSeguidores).toHaveBeenCalledWith(5);
    expect(listarSeguidores).not.toHaveBeenCalledWith(4, 1);
    expect(obterMeuPerfil).not.toHaveBeenCalled();
  });

  it('indica quando o usuário já segue a pessoa', async () => {
    meuSeguindo = [ANA];

    const dados = await carregarPerfilPublico({
      username: 'ana',
      pessoaConhecida: ANA,
      meuId: 4,
    });

    expect(dados.euSigo).toBe(true);
  });

  it('descobre o id do usuário pela API quando a sessão não tem', async () => {
    await carregarPerfilPublico({ username: 'ana', pessoaConhecida: ANA });

    expect(obterMeuPerfil).toHaveBeenCalledOnce();
    expect(listarSeguindo).toHaveBeenCalledWith(4, 1);
  });

  it('acha a pessoa na rede do usuário quando não há dados da navegação', async () => {
    meusSeguidores = [ANA];

    const dados = await carregarPerfilPublico({ username: 'ANA', meuId: 4 });

    expect(dados.pessoa).toEqual(ANA);
  });

  it('ignora dados de navegação de outra pessoa', async () => {
    meuSeguindo = [ANA];

    const dados = await carregarPerfilPublico({
      username: 'ana',
      pessoaConhecida: BIA,
      meuId: 4,
    });

    expect(dados.pessoa).toEqual(ANA);
    expect(dados.euSigo).toBe(true);
  });

  it('devolve null quando a pessoa não é encontrada', async () => {
    await expect(
      carregarPerfilPublico({ username: 'zeca', meuId: 4 }),
    ).resolves.toBeNull();
  });
});
