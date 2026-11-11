import { GENEROS } from './filtrosFilmes';

const semAcento = (texto) =>
  String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// Classificação indicativa (Ministério da Justiça). Valores desconhecidos
// (ex.: PG-13) não têm selo.
const CLASSIFICACOES = {
  L: { texto: 'L', rotulo: 'livre', cor: 'bg-[#1a9e4b] text-white' },
  10: { texto: '10', rotulo: '10 anos', cor: 'bg-[#0a7fd1] text-white' },
  12: { texto: '12', rotulo: '12 anos', cor: 'bg-[#f2c500] text-black' },
  14: { texto: '14', rotulo: '14 anos', cor: 'bg-[#f08a00] text-black' },
  16: { texto: '16', rotulo: '16 anos', cor: 'bg-[#d62d20] text-white' },
  18: { texto: '18', rotulo: '18 anos', cor: 'bg-black text-white' },
};

export function classificacaoIndicativa(valor) {
  if (valor === null || valor === undefined) return null;
  const chave = String(valor)
    .trim()
    .toUpperCase()
    .replace(/\s*ANOS?$/, '');
  const normal = chave === 'LIVRE' ? 'L' : chave.replace(/^\+/, '');
  return CLASSIFICACOES[normal] ?? null;
}

// Id do gênero: usa genres_info; sem ele, tenta casar o nome com GENEROS.
export function generosComId(filme) {
  if (Array.isArray(filme.genres_info) && filme.genres_info.length > 0) {
    return filme.genres_info.map((g) => ({ id: g.id, nome: g.name }));
  }
  return (filme.genres ?? []).map((nome) => {
    const alvo = semAcento(nome);
    const achado = GENEROS.find((g) => semAcento(g.nome) === alvo);
    return { id: achado?.id, nome };
  });
}

const GRUPOS_EQUIPE = [
  { id: 'direcao', titulo: 'Direção', jobs: ['Director'] },
  { id: 'roteiro', titulo: 'Roteiro', jobs: ['Screenplay', 'Writer'] },
  { id: 'fotografia', titulo: 'Fotografia', jobs: ['Director of Photography'] },
  { id: 'musica', titulo: 'Música', jobs: ['Original Music Composer'] },
  { id: 'producao', titulo: 'Produção', jobs: ['Producer'] },
];

// Agrupa a equipe por função (traduzida), sem repetir nome dentro do grupo.
export function agruparEquipe(crew = []) {
  return GRUPOS_EQUIPE.map((grupo) => {
    const pessoas = [];
    for (const pessoa of crew) {
      if (!grupo.jobs.includes(pessoa.job)) continue;
      if (pessoas.some((p) => p.name === pessoa.name)) continue;
      pessoas.push(pessoa);
    }
    return { id: grupo.id, titulo: grupo.titulo, pessoas };
  }).filter((grupo) => grupo.pessoas.length > 0);
}

export function inicial(nome) {
  return (nome ?? '?').trim().charAt(0).toUpperCase() || '?';
}
