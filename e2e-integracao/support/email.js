import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect } from '@playwright/test';

const aqui = dirname(fileURLToPath(import.meta.url));
export const PASTA_EMAIL = resolve(aqui, '../../../backend/.e2e_mail');

export function arquivosDeEmail() {
  if (!existsSync(PASTA_EMAIL)) return [];
  return readdirSync(PASTA_EMAIL)
    .map((nome) => resolve(PASTA_EMAIL, nome))
    .filter((caminho) => statSync(caminho).isFile())
    .sort(
      (a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs || a.localeCompare(b),
    );
}

/** Quoted-printable (RFC 2047/2045) decodificado como bytes UTF-8. */
function decodificarQP(texto) {
  const limpo = texto.replace(/=\r?\n/g, '');
  const bytes = [];
  for (let i = 0; i < limpo.length; i += 1) {
    const hex = limpo.slice(i + 1, i + 3);
    if (limpo[i] === '=' && /^[0-9A-F]{2}$/i.test(hex)) {
      bytes.push(parseInt(hex, 16));
      i += 2;
    } else {
      bytes.push(...Buffer.from(limpo[i], 'utf8'));
    }
  }
  return Buffer.from(bytes).toString('utf8');
}

/** Lê o e-mail gravado (mensagem MIME crua) e devolve assunto, destinatário e corpo. */
function lerEmail(caminho) {
  const bruto = readFileSync(caminho, 'utf8');
  const [cabecalhos, ...resto] = bruto.split(/\r?\n\r?\n/);
  let corpo = resto.join('\n\n');
  if (/content-transfer-encoding:\s*base64/i.test(cabecalhos)) {
    corpo = Buffer.from(corpo.replace(/\s+/g, ''), 'base64').toString('utf8');
  } else if (
    /content-transfer-encoding:\s*quoted-printable/i.test(cabecalhos)
  ) {
    corpo = decodificarQP(corpo);
  }
  let assunto =
    (cabecalhos.match(/^Subject:\s*(.*(?:\r?\n[ \t].*)*)/im) || [])[1] || '';
  assunto = assunto.replace(/\r?\n[ \t]+/g, ' ').trim();
  assunto = assunto.replace(/=\?utf-8\?([bq])\?([^?]*)\?=/gi, (_, tipo, txt) =>
    tipo.toLowerCase() === 'b'
      ? Buffer.from(txt, 'base64').toString('utf8')
      : decodificarQP(txt.replace(/_/g, ' ')),
  );
  const para = (cabecalhos.match(/^To:\s*(.*)$/im) || [])[1]?.trim() || '';
  return { assunto, para, corpo };
}

/** Espera aparecer um e-mail além dos `jaVistos` arquivos e devolve o mais recente. */
export async function esperarNovoEmail(jaVistos = 0) {
  await expect
    .poll(() => arquivosDeEmail().length, {
      message: 'esperando o e-mail chegar na pasta de captura',
      timeout: 15_000,
    })
    .toBeGreaterThan(jaVistos);
  const arquivos = arquivosDeEmail();
  const email = lerEmail(arquivos[arquivos.length - 1]);
  const link = email.corpo.match(
    /http:\/\/localhost:5189\/redefinir-senha\/([^/\s]+)\/([^/\s]+)/,
  );
  return { ...email, link: link?.[0], uid: link?.[1], token: link?.[2] };
}
