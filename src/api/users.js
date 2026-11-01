import { corpoDaRequisicao } from './body';
import { request } from './client';

export const obterMeuPerfil = () => request('/users/me/');

export function editarMeuPerfil(dados) {
  return request('/users/me/', {
    method: 'PATCH',
    body: corpoDaRequisicao(
      {
        username: dados.username,
        email: dados.email,
        first_name: dados.firstName,
        last_name: dados.lastName,
        birth_date: dados.birthDate === '' ? null : dados.birthDate,
        bio: dados.bio,
      },
      { avatar: dados.avatar },
    ),
  });
}

// O back exige o username como confirmação.
export const excluirMinhaConta = (username) =>
  request('/users/me/', { method: 'DELETE', body: { username } });

export const seguirUsuario = (id) =>
  request(`/users/${id}/follow/`, { method: 'POST' });
export const deixarDeSeguir = (id) =>
  request(`/users/${id}/follow/`, { method: 'DELETE' });

export const listarSeguidores = (id, page = 1) =>
  request(`/users/${id}/followers/?page=${page}`, { auth: false });
export const listarSeguindo = (id, page = 1) =>
  request(`/users/${id}/following/?page=${page}`, { auth: false });
