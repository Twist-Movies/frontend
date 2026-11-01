import { request } from './client';

export function listarResenhas(tmdbId, page = 1) {
  return request(`/movies/${tmdbId}/reviews/?page=${page}`);
}

export function criarResenha(tmdbId, { content, containsSpoiler = false }) {
  return request(`/movies/${tmdbId}/reviews/`, {
    method: 'POST',
    body: { content, contains_spoiler: containsSpoiler },
  });
}

export const obterResenha = (id) => request(`/reviews/${id}/`);

export function editarResenha(id, { content, containsSpoiler }) {
  return request(`/reviews/${id}/`, {
    method: 'PATCH',
    body: { content, contains_spoiler: containsSpoiler },
  });
}

export const excluirResenha = (id) =>
  request(`/reviews/${id}/`, { method: 'DELETE' });

export const curtirResenha = (id) =>
  request(`/reviews/${id}/like/`, { method: 'POST' });
export const descurtirResenha = (id) =>
  request(`/reviews/${id}/like/`, { method: 'DELETE' });
