/**
 * O acervo dela está inteiro?
 *
 * Confere, foto por foto, três coisas ao mesmo tempo:
 *
 * 1. Todo endereço guardado no banco aponta para o armazenamento atual — nenhum
 *    sobrou apontando para o provedor antigo.
 * 2. Cada endereço LÊ de verdade. Registro que aponta para o nada é a pior
 *    forma de perda: o painel parece cheio e o site mostra buraco.
 * 3. O que está guardado tem exatamente o tamanho da cópia no backup. É esta
 *    que pega arquivo truncado — e truncado acontece: a migração para o R2 caiu
 *    no meio de um envio, com a conexão morrendo em `UND_ERR_SOCKET`.
 *
 * Roda contra um backup: `npx tsx scripts/verifica-acervo.ts /caminho/do/acervo`.
 * Sem backup para comparar não há verdade contra a qual medir, então o teste
 * falha em vez de passar medindo menos.
 */
import { config } from "dotenv";
import { readFile, readdir } from "node:fs/promises";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { r2Ler } from "@/lib/r2";
import { urlComSslVerificado } from "../src/lib/db-url";

config({ path: ".env.local" });

const PREFIXO = "/fotos/croche/";

async function main() {
  const acervo = process.argv[2] ?? "backup";
  const pasta = `${acervo}/fotos`;

  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
  });

  const imagens = await db.productImage.findMany({ select: { url: true }, orderBy: { url: "asc" } });
  const ajustes = await db.siteSettings.findFirst({ select: { aboutImageUrl: true } });
  const enderecos = [...imagens.map((i) => i.url), ajustes?.aboutImageUrl].filter(
    (u): u is string => Boolean(u)
  );

  let arquivos: string[];
  try {
    arquivos = await readdir(pasta);
  } catch {
    console.log(`✗ não achei o backup em ${pasta} — rode \`pnpm backup\` antes, ou passe o caminho`);
    process.exit(1);
  }

  const problemas: string[] = [];
  let ok = 0;

  for (const url of enderecos) {
    if (!url.startsWith(PREFIXO)) {
      problemas.push(`${url.slice(0, 70)} — não aponta para o armazenamento atual`);
      continue;
    }
    const chave = url.replace(/^\/fotos\//, "");
    const objeto = await r2Ler(chave).catch(() => null);
    if (!objeto) {
      problemas.push(`${chave} — o endereço está no banco mas a foto não lê`);
      continue;
    }
    // O backup achata o caminho com `__`. O nome do arquivo sozinho não serve de
    // chave: `exemplo.jpg` se repete em cinco peças.
    const nome = chave.replace(/^croche\//, "").replaceAll("/", "__");
    if (!arquivos.includes(nome)) {
      problemas.push(`${chave} — sem cópia no backup`);
      continue;
    }
    const copia = await readFile(`${pasta}/${nome}`);
    if (copia.byteLength !== objeto.corpo.byteLength) {
      problemas.push(
        `${chave} — guardado ${objeto.corpo.byteLength}B, backup ${copia.byteLength}B`
      );
      continue;
    }
    ok++;
  }

  console.log(`${ok}/${enderecos.length} fotos leem inteiras e batem com o backup.`);
  if (problemas.length > 0) {
    console.log("");
    problemas.forEach((p) => console.log(`  ✗ ${p}`));
    console.log(`\n✗ ${problemas.length} problema(s) no acervo`);
    await db.$disconnect();
    process.exit(1);
  }
  console.log("\n✓ acervo ok");
  await db.$disconnect();
}

main();
