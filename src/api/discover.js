import { request } from './client';

// Catálogo com filtros e ordenação. Esta rota ainda precisa existir no back
// (contrato em docs/contrato-discover.md). A resposta tem o mesmo formato da
// busca: { page, total_pages, total_results, results }.
export function descobrirFilmes({
  page = 1,
  sort,
  genre,
  decade,
  runtimeMin,
  runtimeMax,
  ratingMin,
} = {}) {
  const params = new URLSearchParams({ page: String(page) });
  const opcionais = {
    sort,
    genre,
    decade,
    runtime_min: runtimeMin,
    runtime_max: runtimeMax,
    rating_min: ratingMin,
  };
  for (const [chave, valor] of Object.entries(opcionais)) {
    if (valor !== undefined && valor !== '') params.set(chave, String(valor));
  }
  return request(`/movies/discover/?${params}`, { auth: false });
}

// Filmes em alta na semana (público). Mesmo formato paginado do discover.
export function filmesEmAlta(page = 1) {
  return request(`/movies/trending/?page=${page}`, { auth: false });
}
