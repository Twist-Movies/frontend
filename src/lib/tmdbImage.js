const BASE = 'https://image.tmdb.org/t/p';

// O back devolve só o caminho relativo do TMDB (ex.: /abc.jpg).
export function imagemTmdb(caminho, tamanho = 'w342') {
  return caminho ? `${BASE}/${tamanho}${caminho}` : undefined;
}

export function anoDe(data) {
  const ano = data ? Number(String(data).slice(0, 4)) : 0;
  return ano > 0 ? ano : undefined;
}

// O TMDB usa nota de 0 a 10; o Twist mostra de 0 a 5 (meias estrelas).
export function notaEm5(notaTmdb) {
  if (typeof notaTmdb !== 'number' || notaTmdb <= 0) return undefined;
  return Math.round(notaTmdb) / 2;
}

export function duracao(minutos) {
  if (!minutos) return undefined;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}min`;
}
