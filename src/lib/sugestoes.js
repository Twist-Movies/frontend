import { listarSeguindo } from '../api/users';

// O back não tem busca nem lista geral de membros. A descoberta usa o que há:
// quem as pessoas que você segue também seguem. Sem ninguém seguido ainda, usa
// a rede de quem segue você. Devolve [{ pessoa, comuns }], os mais
// recorrentes primeiro.
export async function sugerirMembros({
  meuId,
  seguindo,
  seguidores,
  limite = 12,
  fontes = 8,
}) {
  const jaSigo = new Set(seguindo.map((pessoa) => pessoa.id));
  const base = (seguindo.length > 0 ? seguindo : seguidores).slice(0, fontes);
  if (base.length === 0) return [];

  const respostas = await Promise.allSettled(
    base.map((pessoa) => listarSeguindo(pessoa.id)),
  );
  const falha = respostas.find((resposta) => resposta.status === 'rejected');
  if (falha && respostas.every((resposta) => resposta.status === 'rejected')) {
    throw falha.reason;
  }

  const contagem = new Map();
  for (const resposta of respostas) {
    if (resposta.status !== 'fulfilled') continue;
    for (const pessoa of resposta.value.results) {
      if (pessoa.id === meuId || jaSigo.has(pessoa.id)) continue;
      const atual = contagem.get(pessoa.id);
      contagem.set(pessoa.id, { pessoa, comuns: (atual?.comuns ?? 0) + 1 });
    }
  }

  return [...contagem.values()]
    .sort(
      (a, b) =>
        b.comuns - a.comuns || a.pessoa.username.localeCompare(b.pessoa.username),
    )
    .slice(0, limite);
}
