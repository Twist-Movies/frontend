import { describe, expect, it } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
  it('junta as classes e descarta valores falsos', () => {
    expect(cx('a', false, 'b', undefined, null, '', 'c')).toBe('a b c');
  });

  it('devolve string vazia quando não sobra nada', () => {
    expect(cx(false, undefined)).toBe('');
  });
});
