/**
 * Avalia a senha por critérios acumulativos. Serve para orientar quem está
 * cadastrando — a regra que realmente bloqueia o envio é o mínimo de
 * 8 caracteres, verificada na validação do formulário.
 */
export function avaliarSenha(senha) {
  let pontos = 0;
  if (senha.length >= 8) pontos++;
  if (senha.length >= 12) pontos++;
  if (/[a-zA-Z]/.test(senha) && /\d/.test(senha)) pontos++;
  if (/[^a-zA-Z0-9]/.test(senha)) pontos++;

  const forca = pontos <= 1 ? 'fraca' : pontos <= 2 ? 'media' : 'forte';
  const rotulo =
    forca === 'fraca' ? 'Fraca' : forca === 'media' ? 'Média' : 'Forte';

  return {
    forca,
    pontos,
    rotulo,
    percentual: senha.length === 0 ? 0 : Math.max(25, (pontos / 4) * 100),
  };
}
