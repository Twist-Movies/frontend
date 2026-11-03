// Junta todas as páginas de uma listagem paginada do DRF ({ results, next }).
// `max` evita um laço longo em redes muito grandes (20 itens por página).
export async function todasAsPaginas(carregarPagina, { max = 10 } = {}) {
  const itens = [];
  for (let pagina = 1; pagina <= max; pagina += 1) {
    const dados = await carregarPagina(pagina);
    itens.push(...dados.results);
    if (!dados.next) break;
  }
  return itens;
}
