/**
 * Funcionalidades ligáveis por variável de ambiente, sem mexer no código.
 *
 * - series: em espera por decisão da equipe (a spec e o back-end ainda só
 *   cobrem filmes). Ligar com VITE_FEATURE_SERIES=true.
 *
 * Lido a cada chamada (e não no import) para os testes conseguirem alternar.
 */
export function isEnabled(feature) {
  switch (feature) {
    case 'series':
      return import.meta.env.VITE_FEATURE_SERIES === 'true';
    default:
      return false;
  }
}

/** Tira de uma lista (menus, por exemplo) os itens de funcionalidade desligada. */
export function onlyEnabled(items) {
  return items.filter((item) => !item.feature || isEnabled(item.feature));
}
