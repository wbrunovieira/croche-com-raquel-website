import { deflateSync } from "node:zlib";

/**
 * Gera um PNG grande, do tamanho de uma foto de celular de verdade.
 *
 * Existe porque a verificação do painel só subia foto quando alguém lembrava
 * de passar `FOTO_DE_TESTE=` na linha de comando — e o padrão, sem foto, deixou
 * passar o defeito que chegou ao Bruno: Server Action aceita 1 MB de corpo, e
 * qualquer foto de celular tem mais que isso. O envio quebrava com 500 antes de
 * a validação rodar, e nenhum check reclamava porque nenhum check enviava uma
 * foto de tamanho real.
 *
 * O conteúdo é **ruído**, de propósito: PNG comprime, e uma imagem de cor
 * chapada de 3000×4000 sairia com poucos kB — passaria no limite e o teste
 * voltaria a não testar nada. Ruído não comprime, então o arquivo tem o peso
 * que promete.
 *
 * PNG escrito à mão para não trazer dependência de imagem só para o teste: são
 * quatro blocos (assinatura, IHDR, IDAT, IEND) e um CRC.
 */

const TABELA_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf: Buffer) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TABELA_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function bloco(tipo: string, dados: Buffer) {
  const tamanho = Buffer.alloc(4);
  tamanho.writeUInt32BE(dados.length);
  const corpo = Buffer.concat([Buffer.from(tipo, "ascii"), dados]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo));
  return Buffer.concat([tamanho, corpo, crc]);
}

/**
 * O padrão dá ~3,2 MB, que é o peso de uma foto de celular de verdade — e o que
 * importa aqui é o PESO, não a resolução: é ele que estoura o limite de corpo
 * do Server Action. Resolução maior só deixaria o teste lento à toa (a 1600 ×
 * 2400 o arquivo passa de 10 MB).
 */
export function fotoDeCelularFalsa(largura = 900, altura = 1200): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largura, 0);
  ihdr.writeUInt32BE(altura, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 2; // RGB
  // 10, 11, 12 ficam em zero: deflate, filtro padrão, sem entrelaçamento.

  // Cada linha começa com o byte de filtro (0 = nenhum) e segue em RGB.
  const linha = 1 + largura * 3;
  const cru = Buffer.alloc(linha * altura);
  // xorshift32, semeado fixo: o arquivo é sempre o mesmo entre execuções, mas
  // a sequência é desordenada o bastante para o deflate não ter o que comprimir.
  // A primeira tentativa usou uma conta linear em x e y — o deflate reconheceu o
  // padrão e o "3 MB" saiu com 100 kB, ou seja, o teste voltaria a não testar.
  let estado = 0x9e3779b9;
  for (let y = 0; y < altura; y++) {
    const base = y * linha;
    cru[base] = 0;
    for (let x = 0; x < largura * 3; x++) {
      estado ^= estado << 13;
      estado ^= estado >>> 17;
      estado ^= estado << 5;
      cru[base + 1 + x] = estado & 0xff;
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloco("IHDR", ihdr),
    bloco("IDAT", deflateSync(cru, { level: 1 })),
    bloco("IEND", Buffer.alloc(0)),
  ]);
}
