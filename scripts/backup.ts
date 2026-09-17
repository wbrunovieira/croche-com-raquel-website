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
 * backup: se o armazenamento some, a lista aponta para o nada. Foi esse backup
 * que permitiu migrar as 74 fotos para o R2 quando o Vercel Blob foi suspenso e
 * passou a devolver 403 em toda leitura — a rede montada para o desastre serviu
 * para a migração forçada.
 *
 *   npx tsx scripts/backup.ts            → escreve em ./backup/
 *   npx tsx scripts/backup.ts --destino /caminho
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { config as carregarEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";
import { r2Ler } from "../src/lib/r2";

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
  /**
   * As fotos vêm pelas URLs que o BANCO guarda, e não de uma listagem do
   * armazenamento. Três razões, e a primeira foi aprendida do jeito difícil:
   *
   * **1. Listar custa operação.** O `list()` do Vercel Blob é operação avançada,
   * e o gratuito dá 2.000 por mês para a CONTA inteira. Este backup rodava de
   * seis em seis horas gastando duas por execução — pouco, mas era gasto em cima
   * do teto que estourou e suspendeu o armazenamento em 16/09/2026. Lendo a URL
   * pública, o custo em operações é **zero**.
   *
   * **2. Funciona em qualquer armazenamento.** Era Vercel Blob, virou Cloudflare
   * R2. Backup amarrado ao SDK de um provedor precisa ser reescrito a cada
   * mudança — e é justamente na mudança que ele mais importa.
   *
   * **3. Copia o que o site realmente usa.** A listagem trazia órfãos também.
   * Órfão é, por definição, o que nada aponta — e agora que apagar peça não
   * apaga mais a foto, eles vão existir sempre.
   */
  /**
   * **Lê do R2 direto, e não pela rota `/fotos` do site.**
   *
   * Desde a migração as fotos ficam em caminho relativo, então "baixar a URL"
   * exigiria montar o endereço do site e passar por ele. Isso amarraria o
   * backup ao site estar NO AR — e o dia em que o site cai é exatamente o dia
   * em que o backup precisa funcionar. Ler do armazenamento pula essa
   * dependência.
   *
   * Custa uma leitura de classe B por foto (73 por execução, contra 10 milhões
   * gratuitos no mês): o argumento de não gastar operação, que nos tirou do
   * `list()` do Blob, continua valendo — só que aqui a conta não aperta.
   *
   * URL absoluta que sobrou de antes continua sendo buscada por HTTP.
   */
  async function baixar(url: string): Promise<Buffer | null> {
    try {
      if (url.startsWith("/fotos/")) {
        const objeto = await r2Ler(url.replace(/^\/fotos\//, ""));
        return objeto ? Buffer.from(objeto.corpo) : null;
      }
      const r = await fetch(url);
      return r.ok ? Buffer.from(await r.arrayBuffer()) : null;
    } catch {
      return null;
    }
  }

  /**
   * **As fotos são DESCOBERTAS no que acabou de ser copiado, e não pedidas a
   * uma tabela escolhida a dedo.**
   *
   * Aqui era `db.productImage.findMany()`. Parecia certo — é onde moram as
   * fotos das peças — e deixava uma de fora: o retrato da Raquel, que mora em
   * `siteSettings.aboutImageUrl`. O backup rodava verde havia semanas sem nunca
   * ter copiado aquele arquivo. Ele só não se perdeu porque uma versão bem
   * antiga, que listava o armazenamento inteiro, tinha guardado uma cópia.
   *
   * Acrescentar `siteSettings` na lista consertaria o caso e deixaria a armadilha
   * de pé para o próximo campo de imagem que alguém criar. Varrendo o `dados` já
   * montado, qualquer campo de texto que PAREÇA foto entra no backup sozinho —
   * inclusive os que ainda não existem.
   */
  const imagens = [
    ...new Set(
      Object.values(dados)
        .flat()
        .flatMap((linha) => Object.values((linha ?? {}) as Record<string, unknown>))
        .filter(
          (v): v is string =>
            typeof v === "string" &&
            (v.startsWith("/fotos/") || /^https?:\/\/\S+\.(jpe?g|png|webp|avif|gif)$/i.test(v))
        )
    ),
  ]
    .sort()
    .map((url) => ({ url }));

  const mapa: Record<string, string> = {};
  let n = 0;
  let bytes = 0;
  const falhas: string[] = [];

  for (const { url } of imagens) {
    // O nome no disco é o caminho com as barras trocadas, para o arquivo dizer
    // de que peça ele é sem precisar consultar o banco. Os dois prefixos de
    // roteamento (`/fotos/`, do site, e `croche/`, do bucket compartilhado)
    // saem fora: eles não distinguem nada entre si e só alongariam o nome — e
    // mantê-los fora preserva os nomes que os backups anteriores já usavam.
    const caminho = url.startsWith("/fotos/")
      ? url.replace(/^\/fotos\/croche\//, "").replace(/^\/fotos\//, "")
      : new URL(url).pathname.replace(/^\//, "");
    const nome = caminho.replace(/\//g, "__");

    const conteudo = await baixar(url);
    if (!conteudo) {
      falhas.push(url.slice(0, 80));
      continue;
    }
    await writeFile(join(DESTINO, "fotos", nome), conteudo);
    mapa[url] = nome;
    n++;
    bytes += conteudo.length;
  }

  await writeFile(join(DESTINO, "fotos.json"), JSON.stringify(mapa, null, 2));

  /**
   * Foto que não baixa FALHA o backup, e isso é de propósito.
   *
   * Backup que grava o banco e pula as fotos em silêncio é o pior resultado
   * possível: ele commita, o histórico parece saudável, e só no dia de restaurar
   * se descobre que as imagens não estão lá. Se o armazenamento estiver fora do
   * ar, melhor a execução falhar e alguém ver.
   */
  if (falhas.length > 0) {
    console.log(`\n  ✗ ${falhas.length} foto(s) não baixaram:`);
    for (const f of falhas.slice(0, 5)) console.log(`      ${f}`);
    throw new Error(
      `${falhas.length} de ${imagens.length} fotos não baixaram — backup incompleto, ` +
        "e backup incompleto que passa é pior que backup que falha."
    );
  }


  console.log(`\n  ${n} fotos · ${(bytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  backup de ${quando} em ${DESTINO}/`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
