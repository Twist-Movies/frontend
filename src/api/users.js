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
        // Só vai quando o e-mail muda (o back exige a senha atual nesse caso).
        current_password: dados.currentPassword || undefined,
      },
      { avatar: dados.avatar },
    ),
  });
}

// O back exige username (confirmação) e a senha atual.
export const excluirMinhaConta = ({ username, password }) =>
  request('/users/me/', { method: 'DELETE', body: { username, password } });

export const seguirUsuario = (id) =>
  request(`/users/${id}/follow/`, { method: 'POST' });
export const deixarDeSeguir = (id) =>
  request(`/users/${id}/follow/`, { method: 'DELETE' });

export const listarSeguidores = (id, page = 1) =>
  request(`/users/${id}/followers/?page=${page}`, { auth: false });
export const listarSeguindo = (id, page = 1) =>
  request(`/users/${id}/following/?page=${page}`, { auth: false });

// Busca de pessoas por username (rota pública e paginada).
export const buscarUsuarios = (q, page = 1) =>
  request(`/users/search/?q=${encodeURIComponent(q)}&page=${page}`, {
    auth: false,
  });

export const listarResenhasDoUsuario = (id, page = 1) =>
  request(`/users/${id}/reviews/?page=${page}`, { auth: false });
