/**
 * Backup do que a Raquel cadastrou: o banco e as fotos.
 *
 * **O que ele protege.** O código está no GitHub e o site se reconstrói sozinho.
 * O que não se reconstrói é o trabalho dela — as peças, os textos, e sobretudo
 * as fotos: cada uma é uma peça fotografada, recortada e cadastrada. Se o banco
 * se perder, se a conta cair, ou se alguém entrar no painel e apagar, é isto que
 * traz tudo de volta.
 *
 * **Por que JSON e não `pg_dump`.** O banco é PostgreSQL 18, e um dump só
 * restaura num servidor que entenda aquela versão — dependência que envelhece
 * junto com o provedor. O JSON é legível, restaura em qualquer Postgres e pode
 * ser lido por gente, que é o que importa no dia em que alguém abrir a pasta
 * sem saber o que procurar. O catálogo é pequeno: isto não vale para um banco
 * grande, e vale muito para este.
 *
 * **As fotos vêm inteiras**, e não como lista de URLs. URL guardada não é
 * backup: se o Blob some, a lista aponta para o nada.
 *
 *   npx tsx scripts/backup.ts            → escreve em ./backup/
 *   npx tsx scripts/backup.ts --destino /caminho
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { config as carregarEnv } from "dotenv";
import { list } from "@vercel/blob";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";

carregarEnv({ path: ".env.local", quiet: true });

const argumentos = process.argv.slice(2);
const iDestino = argumentos.indexOf("--destino");
const DESTINO = iDestino >= 0 ? argumentos[iDestino + 1]! : "backup";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

/**
 * As tabelas, na ordem em que precisam ser restauradas — pai antes de filho.
 * A ordem é parte do backup: sem ela, restaurar exige adivinhar as dependências.
 */
const TABELAS = [
  "siteSettings",
  "user",
  "category",
  "subcategory",
  "collection",
  "optionGroup",
  "optionValue",
  "product",
  "productImage",
  "productOptionGroup",
  "productOptionValue",
  "page",
  "faqItem",
  "testimonial",
] as const;

/**
 * O schema inteiro tem de estar na lista acima.
 *
 * Um backup que pula uma tabela em silêncio é pior que não ter backup: ele dá
 * confiança falsa e só se descobre incompleto no dia em que precisa. A primeira
 * versão listava `faq`, que não existe — o modelo chama `FaqItem` —, e o script
 * apenas avisava e seguia. Agora ele CONFERE contra o que o cliente Prisma
 * conhece e falha se houver tabela de fora.
 */
function conferirCobertura(cliente: object) {
  const doPrisma = Object.keys(cliente).filter(
    (k) => !k.startsWith("$") && !k.startsWith("_") && typeof (cliente as Record<string, unknown>)[k] === "object"
  );
  const faltando = doPrisma.filter((t) => !TABELAS.includes(t as (typeof TABELAS)[number]));
  if (faltando.length > 0) {
    throw new Error(
      `Tabelas fora do backup: ${faltando.join(", ")}. ` +
        "Acrescente em TABELAS, na ordem certa (pai antes de filho)."
    );
  }
}

/** Decimal e Date não sobrevivem ao `JSON.stringify` como eles mesmos. */
function serializavel(valor: unknown): unknown {
  if (valor === null || valor === undefined) return valor;
  if (valor instanceof Date) return { __tipo: "Date", v: valor.toISOString() };
  if (typeof valor === "object" && "toFixed" in (valor as object)) {
    return { __tipo: "Decimal", v: String(valor) };
  }
  if (Array.isArray(valor)) return valor.map(serializavel);
  if (typeof valor === "object") {
    return Object.fromEntries(
      Object.entries(valor as Record<string, unknown>).map(([k, v]) => [k, serializavel(v)])
    );
  }
  return valor;
}

async function main() {
  conferirCobertura(db);

  const quando = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  await mkdir(join(DESTINO, "fotos"), { recursive: true });

  // ---- banco ----
  const dados: Record<string, unknown[]> = {};
  for (const tabela of TABELAS) {
    const modelo = (db as unknown as Record<string, { findMany: () => Promise<unknown[]> }>)[tabela];
    if (!modelo?.findMany) {
      throw new Error(`A tabela "${tabela}" está na lista mas não existe no schema.`);
    }
    const linhas = await modelo.findMany();
    dados[tabela] = linhas.map(serializavel) as unknown[];
    console.log(`  ${String(linhas.length).padStart(4)} × ${tabela}`);
  }

  await writeFile(
    join(DESTINO, "banco.json"),
    JSON.stringify({ geradoEm: new Date().toISOString(), ordem: TABELAS, dados }, null, 2)
  );

  // ---- fotos ----
  // O nome no disco é o caminho do Blob com as barras trocadas, para o arquivo
  // dizer de que peça ele é sem precisar consultar o banco.
  let cursor: string | undefined;
  let n = 0;
  let bytes = 0;
  do {
    const pagina = await list({ cursor, limit: 1000 });
    for (const blob of pagina.blobs) {
      const conteudo = Buffer.from(await (await fetch(blob.url)).arrayBuffer());
      const nome = new URL(blob.url).pathname.replace(/^\//, "").replace(/\//g, "__");
      await writeFile(join(DESTINO, "fotos", nome), conteudo);
      n++;
      bytes += conteudo.length;
    }
    cursor = pagina.cursor;
  } while (cursor);

  // O mapa de URL para arquivo: é o que permite recolocar cada foto no lugar
  // certo se o Blob precisar ser refeito do zero.
  const mapa = await (async () => {
    const saida: Record<string, string> = {};
    let c: string | undefined;
    do {
      const p = await list({ cursor: c, limit: 1000 });
      for (const b of p.blobs) {
        saida[b.url] = new URL(b.url).pathname.replace(/^\//, "").replace(/\//g, "__");
      }
      c = p.cursor;
    } while (c);
    return saida;
  })();
  await writeFile(join(DESTINO, "fotos.json"), JSON.stringify(mapa, null, 2));

  console.log(`\n  ${n} fotos · ${(bytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  backup de ${quando} em ${DESTINO}/`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
