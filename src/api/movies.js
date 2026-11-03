import { request } from './client';

const filme = (tmdbId) => `/movies/${tmdbId}`;

// A busca é pública: sem token, para um token vencido não derrubar a consulta.
export function buscarFilmes({ q, page = 1 }) {
  const query = new URLSearchParams({ q, page: String(page) });
  return request(`/movies/search/?${query}`, { auth: false });
}

export function detalheDoFilme(tmdbId) {
  return request(`${filme(tmdbId)}/`);
}

export const marcarAssistido = (tmdbId) =>
  request(`${filme(tmdbId)}/watch/`, { method: 'POST' });
export const desmarcarAssistido = (tmdbId) =>
  request(`${filme(tmdbId)}/watch/`, { method: 'DELETE' });

export const adicionarAWatchlist = (tmdbId) =>
  request(`${filme(tmdbId)}/watchlist/`, { method: 'POST' });
export const removerDaWatchlist = (tmdbId) =>
  request(`${filme(tmdbId)}/watchlist/`, { method: 'DELETE' });

export const avaliarFilme = (tmdbId, stars) =>
  request(`${filme(tmdbId)}/rating/`, { method: 'PUT', body: { stars } });
export const removerAvaliacao = (tmdbId) =>
  request(`${filme(tmdbId)}/rating/`, { method: 'DELETE' });

// reaction: 'LIKE' | 'DISLIKE'
export const reagirAoFilme = (tmdbId, reaction) =>
  request(`${filme(tmdbId)}/reaction/`, { method: 'PUT', body: { reaction } });
export const removerReacao = (tmdbId) =>
  request(`${filme(tmdbId)}/reaction/`, { method: 'DELETE' });
