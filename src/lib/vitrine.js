import { buscarFilmes } from '../api/movies';
import { anoDe, imagemTmdb, notaEm5 } from './tmdbImage';

// O back ainda não tem uma rota de "populares". Enquanto isso, a vitrine é uma
// lista curada de títulos consultados na busca pública (/movies/search/).
// O ano ajuda a escolher a obra certa quando há refilmagens ou homônimos.
export const VITRINE = [
  { titulo: 'Cidade de Deus', ano: 2002 },
  { titulo: 'Bacurau', ano: 2019 },
  { titulo: 'Central do Brasil', ano: 1998 },
  { titulo: 'O Auto da Compadecida', ano: 2000 },
  { titulo: 'Parasita', ano: 2019 },
  { titulo: 'Pulp Fiction', ano: 1994 },
  { titulo: 'Interestelar', ano: 2014 },
  { titulo: 'O Poderoso Chefão', ano: 1972 },
  { titulo: 'Clube da Luta', ano: 1999 },
  { titulo: 'Cinema Paradiso', ano: 1988 },
  { titulo: 'Whiplash', ano: 2014 },
  { titulo: 'Amélie Poulain', ano: 2001 },
];

const CHAVE_CACHE = 'twist:vitrine:v1';
const VALIDADE_MS = 6 * 60 * 60 * 1000;

function lerCache() {
  try {
    const { salvoEm, itens } = JSON.parse(localStorage.getItem(CHAVE_CACHE));
    const valido =
      Array.isArray(itens) &&
      itens.length > 0 &&
      Date.now() - salvoEm < VALIDADE_MS;
    return valido ? itens : null;
  } catch {
    return null;
  }
}

function gravarCache(itens) {
  try {
    localStorage.setItem(
      CHAVE_CACHE,
      JSON.stringify({ salvoEm: Date.now(), itens }),
    );
  } catch {
    // Sem cache (armazenamento cheio ou bloqueado): só consulta de novo.
  }
}

function escolher(resultados, ano) {
  const comPoster = resultados.filter((filme) => filme.poster_path);
  return comPoster.find((filme) => anoDe(filme.release_date) === ano) ?? comPoster[0];
}

function paraItem(filme) {
  return {
    id: filme.tmdb_id,
    title: filme.title,
    year: anoDe(filme.release_date),
    posterUrl: imagemTmdb(filme.poster_path),
    averageRating: notaEm5(filme.tmdb_rating_average),
  };
}

// Devolve os filmes da vitrine. Falhas isoladas são ignoradas; só dá erro se
// nenhuma consulta funcionar (aí o primeiro erro é repassado).
export async function carregarVitrine() {
  const emCache = lerCache();
  if (emCache) return emCache;

  const respostas = await Promise.allSettled(
    VITRINE.map(({ titulo }) => buscarFilmes({ q: titulo })),
  );

  const falha = respostas.find((resposta) => resposta.status === 'rejected');
  if (falha && respostas.every((resposta) => resposta.status === 'rejected')) {
    throw falha.reason;
  }

  const itens = respostas.flatMap((resposta, i) => {
    if (resposta.status !== 'fulfilled') return [];
    const filme = escolher(resposta.value.results ?? [], VITRINE[i].ano);
    return filme ? [paraItem(filme)] : [];
  });

  const unicos = [...new Map(itens.map((item) => [item.id, item])).values()];
  if (unicos.length > 0) gravarCache(unicos);
  return unicos;
}
