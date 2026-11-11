import { request } from './client';

// Comentários de quem o usuário segue (exige login), mais recentes primeiro.
export const listarFeed = (page = 1) => request(`/feed/?page=${page}`);
