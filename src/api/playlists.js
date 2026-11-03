import { corpoDaRequisicao } from './body';
import { request } from './client';

function corpo({ name, description, isPublic, cover }) {
  return corpoDaRequisicao(
    { name, description, is_public: isPublic },
    { cover },
  );
}

export const listarPlaylists = (page = 1) =>
  request(`/playlists/?page=${page}`);

export const obterPlaylist = (id) => request(`/playlists/${id}/`);

export const criarPlaylist = (dados) =>
  request('/playlists/', { method: 'POST', body: corpo(dados) });

export const editarPlaylist = (id, dados) =>
  request(`/playlists/${id}/`, { method: 'PATCH', body: corpo(dados) });

export const excluirPlaylist = (id) =>
  request(`/playlists/${id}/`, { method: 'DELETE' });

export const adicionarFilmeNaPlaylist = (id, tmdbId) =>
  request(`/playlists/${id}/movies/`, {
    method: 'POST',
    body: { tmdb_id: tmdbId },
  });

export const removerFilmeDaPlaylist = (id, tmdbId) =>
  request(`/playlists/${id}/movies/${tmdbId}/`, { method: 'DELETE' });
