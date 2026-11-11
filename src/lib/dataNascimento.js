// Data de nascimento no formato dd/mm/aaaa (máscara) <-> ISO yyyy-mm-dd.

export function aplicarMascaraData(valor) {
  const d = String(valor ?? '')
    .replace(/\D/g, '')
    .slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

const COMPLETA = /^(\d{2})\/(\d{2})\/(\d{4})$/;

function partes(texto) {
  const m = COMPLETA.exec(texto ?? '');
  if (!m) return null;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  const real = new Date(Date.UTC(ano, mes - 1, dia));
  if (
    real.getUTCFullYear() !== ano ||
    real.getUTCMonth() !== mes - 1 ||
    real.getUTCDate() !== dia
  )
    return null;
  return { dia, mes, ano };
}

// '10/05/1999' -> '1999-05-10'; '' quando incompleta ou inexistente.
export function dataParaIso(texto) {
  const p = partes(texto);
  if (!p) return '';
  const dois = (n) => String(n).padStart(2, '0');
  return `${p.ano}-${dois(p.mes)}-${dois(p.dia)}`;
}

// '1999-05-10' -> '10/05/1999'; '' quando não for ISO.
export function isoParaData(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

function hojeIso() {
  const agora = new Date();
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

// Devolve a mensagem de erro ou null. Vazio é tratado por quem chama.
export function validarDataNascimento(texto) {
  const iso = dataParaIso(texto);
  if (!iso) return 'Use uma data válida no formato dd/mm/aaaa.';
  if (iso > hojeIso()) return 'A data de nascimento não pode ser no futuro.';
  if (iso < '1900-01-01') return 'Informe uma data a partir de 1900.';
  return null;
}
