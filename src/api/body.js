// Monta o corpo de um PATCH/POST: JSON quando não há arquivo, FormData quando há.
// `campos` ignora valores undefined.
export function corpoDaRequisicao(campos, arquivos = {}) {
  const limpos = Object.fromEntries(
    Object.entries(campos).filter(([, valor]) => valor !== undefined),
  );
  const temArquivo = Object.values(arquivos).some(Boolean);
  if (!temArquivo) return limpos;

  const form = new FormData();
  for (const [campo, valor] of Object.entries(limpos)) {
    form.append(campo, valor === null ? '' : String(valor));
  }
  for (const [campo, arquivo] of Object.entries(arquivos)) {
    if (arquivo) form.append(campo, arquivo);
  }
  return form;
}
