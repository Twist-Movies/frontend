export function formatarData(iso) {
  if (!iso) return '';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  return data.toLocaleDateString('pt-BR');
}

export function nomeCompleto({ first_name: nome, last_name: sobrenome }) {
  return `${nome ?? ''} ${sobrenome ?? ''}`.trim();
}
