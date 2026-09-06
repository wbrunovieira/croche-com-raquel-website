import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// `promisify(scrypt)` perde a sobrecarga que aceita opções, então a promessa
// é montada à mão.
function derivar(
  senha: string,
  salt: Buffer,
  tamanho: number,
  opcoes: ScryptOptions
): Promise<Buffer> {
  return new Promise((resolver, rejeitar) => {
    scrypt(senha, salt, tamanho, opcoes, (erro, chave) =>
      erro ? rejeitar(erro) : resolver(chave)
    );
  });
}

/**
 * Hash de senha com scrypt, do `node:crypto`.
 *
 * scrypt é um KDF de senha de verdade — memory-hard, recomendado pela OWASP ao
 * lado de argon2 e bcrypt. Vem no Node, então não entra dependência nova nem
 * módulo nativo para compilar no deploy.
 *
 * Parâmetros: N=2^15 (32768), r=8, p=1, saída de 64 bytes. Custo de memória de
 * ~32 MB por verificação, que é caro para quem tenta força bruta e irrelevante
 * para um login por vez.
 *
 * Formato guardado: `scrypt$N$r$p$<salt em hex>$<hash em hex>`. Os parâmetros
 * vão junto de propósito: quando eles mudarem, as senhas antigas continuam
 * verificáveis.
 */
const N = 32768;
const R = 8;
const P = 1;
const TAMANHO = 64;

export async function gerarHashDeSenha(senha: string): Promise<string> {
  const salt = randomBytes(16);
  const derivada = await derivar(senha.normalize("NFKC"), salt, TAMANHO, {
    N,
    r: R,
    p: P,
    maxmem: 256 * 1024 * 1024,
  });
  return [
    "scrypt",
    N,
    R,
    P,
    salt.toString("hex"),
    derivada.toString("hex"),
  ].join("$");
}

export async function conferirSenha(senha: string, guardado: string): Promise<boolean> {
  const partes = guardado.split("$");
  if (partes.length !== 6 || partes[0] !== "scrypt") return false;

  const [, n, r, p, saltHex, hashHex] = partes;
  const salt = Buffer.from(saltHex, "hex");
  const esperado = Buffer.from(hashHex, "hex");

  const derivada = await derivar(senha.normalize("NFKC"), salt, esperado.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 256 * 1024 * 1024,
  });

  // Comparação em tempo constante: `===` vazaria, pelo tempo de resposta,
  // quantos bytes do hash bateram.
  return derivada.length === esperado.length && timingSafeEqual(derivada, esperado);
}

/**
 * Política de senha do painel.
 *
 * Mínimo de 8 caracteres, com maiúscula, número e caractere especial. Mora
 * aqui, e não dentro do script de criação, porque uma tela de troca de senha
 * vai precisar exatamente da mesma regra — duas cópias divergem na primeira
 * vez que alguém mexe numa delas.
 *
 * Devolve a lista do que falta, e não um booleano: quem digita precisa saber
 * qual exigência não cumpriu, senão fica tentando no escuro.
 */
export function conferirPoliticaDeSenha(senha: string): string[] {
  const faltas: string[] = [];
  if (senha.length < 8) faltas.push("pelo menos 8 caracteres");
  if (!/[A-ZÀ-Þ]/.test(senha)) faltas.push("uma letra maiúscula");
  if (!/[0-9]/.test(senha)) faltas.push("um número");
  if (!/[^A-Za-zÀ-ÿ0-9]/.test(senha)) faltas.push("um caractere especial");
  return faltas;
}
