/** Junta classes do Tailwind ignorando valores falsos: cx('a', cond && 'b'). */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}
