import { listarSeguidores, listarSeguindo, obterMeuPerfil } from '../api/users';
import { todasAsPaginas } from './paginas';

const igual = (a, b) => a?.toLowerCase() === b?.toLowerCase();

// O back não tem consulta de perfil por username. Os dados de quem vem de uma
// resenha ou de uma lista de seguidores chegam pela navegação
// (`pessoaConhecida`); num link aberto direto, só dá para achar quem está na
// rede do usuário logado. Devolve null quando a pessoa não é encontrada.
export async function carregarPerfilPublico({ username, pessoaConhecida, meuId }) {
  const eu = meuId ?? (await obterMeuPerfil()).id;
  const meuSeguindo = await todasAsPaginas((pagina) => listarSeguindo(eu, pagina));

  let pessoa = igual(pessoaConhecida?.username, username) ? pessoaConhecida : null;
  if (!pessoa) {
    const meusSeguidores = await todasAsPaginas((pagina) =>
      listarSeguidores(eu, pagina),
    );
    pessoa =
      [...meuSeguindo, ...meusSeguidores].find((item) =>
        igual(item.username, username),
      ) ?? null;
  }
  if (!pessoa) return null;

  const [seguidores, seguindo] = await Promise.all([
    listarSeguidores(pessoa.id),
    listarSeguindo(pessoa.id),
  ]);

  return {
    pessoa,
    seguidores,
    seguindo,
    euSigo: meuSeguindo.some((item) => item.id === pessoa.id),
  };
}
