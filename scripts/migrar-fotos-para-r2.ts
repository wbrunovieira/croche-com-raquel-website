/**
 * Leva as fotos das peças do Vercel Blob para o Cloudflare R2.
 *
 * **A fonte é o BACKUP, não o Blob — e isso não é preferência.** No
 * armazenamento suspenso, `list` funciona e `get` devolve **403**: dá para ver
 * que os arquivos existem e não dá para lê-los. Quem tentou puxar direto do
 * Blob recebeu 51 erros seguidos (achado da sessão do darkfilm, que passou por
 * isso antes de nós). O que salva este projeto é o backup de seis em seis horas
 * ter rodado ANTES da suspensão: as 74 fotos estão em disco.
 *
 * *Fica a lição, que vale além daqui:* o backup não serviu para desastre, serviu
 * para migração forçada. A rede que se monta para o caso raro é a mesma que
 * resolve o caso chato.
 *
 * **Idempotente.** A chave no R2 repete o caminho do Blob, então rodar de novo
 * sobrescreve o mesmo objeto em vez de duplicar. E a atualização do banco só
 * acontece depois do envio dar certo: se a rede cair no meio, as fotos já
 * enviadas ficam, o banco continua coerente, e a próxima execução termina o
 * serviço.
 *
 *   npx tsx scripts/migrar-fotos-para-r2.ts <pasta-do-backup>            (lista)
 *   npx tsx scripts/migrar-fotos-para-r2.ts <pasta-do-backup> --aplicar
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { config as carregarEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";
import { enderecoPublico, r2Configurado, r2Enviar } from "../src/lib/r2";

carregarEnv({ path: ".env.local", quiet: true });

const [pasta] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const APLICAR = process.argv.includes("--aplicar");

if (!pasta) {
  console.error("uso: npx tsx scripts/migrar-fotos-para-r2.ts <pasta-do-backup> [--aplicar]");
  process.exit(1);
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

/** O tipo pelo final do nome. O R2 guarda o que a gente disser, e errar aqui faz
 *  o navegador baixar a foto em vez de mostrar. */
function tipoDe(nome: string): string {
  if (/\.png$/i.test(nome)) return "image/png";
  if (/\.webp$/i.test(nome)) return "image/webp";
  if (/\.avif$/i.test(nome)) return "image/avif";
  return "image/jpeg";
}

async function main() {
  if (APLICAR && !r2Configurado()) {
    throw new Error(
      "faltam as variáveis do R2 no .env.local: R2_ENDPOINT, R2_BUCKET, " +
        "R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY"
    );
  }

  // O mapa de URL → arquivo que o backup gravou. É ele que liga o que está no
  // banco ao que está em disco.
  const mapa = JSON.parse(await readFile(join(pasta, "fotos.json"), "utf8")) as Record<string, string>;
  const emDisco = new Set(await readdir(join(pasta, "fotos")));

  const imagens = await db.productImage.findMany({
    select: { id: true, url: true, product: { select: { name: true } } },
  });

  const noBlob = imagens.filter((i) => i.url.includes("blob.vercel-storage.com"));
  console.log(`${imagens.length} fotos no banco · ${noBlob.length} ainda no Vercel Blob\n`);

  let feitas = 0;
  const semArquivo: string[] = [];

  for (const img of noBlob) {
    const arquivo = mapa[img.url];
    if (!arquivo || !emDisco.has(arquivo)) {
      semArquivo.push(`${img.product.name} — ${img.url.split("/").pop()}`);
      continue;
    }

    // A chave repete o caminho do Blob sob o prefixo do projeto:
    // `croche/produtos/<slug>/<arquivo>`. O prefixo existe porque o bucket é
    // compartilhado; repetir o resto do caminho torna o endereço reconhecível e
    // faz uma reexecução sobrescrever em vez de duplicar.
    const chave = `croche/${new URL(img.url).pathname.replace(/^\//, "")}`;
    console.log(`  ${img.product.name}`);
    // No ensaio o endereço público pode não existir ainda — ele depende da
    // credencial, e o ensaio serve exatamente para conferir a cobertura ANTES
    // de haver credencial. Então mostra a chave, que é o que importa aqui.
    console.log(`      → ${enderecoPublico(chave)}`);

    if (!APLICAR) continue;

    const bytes = await readFile(join(pasta, "fotos", arquivo));
    const url = await r2Enviar(
      chave,
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
      tipoDe(arquivo)
    );
    // Só depois do envio dar certo. Se cair aqui, a foto está no R2 e o banco
    // ainda aponta para o Blob — a próxima execução conserta.
    await db.productImage.update({ where: { id: img.id }, data: { url } });
    feitas++;
  }

  if (semArquivo.length > 0) {
    console.log(`\n  ⚠ ${semArquivo.length} foto(s) sem cópia no backup:`);
    for (const s of semArquivo) console.log(`      ${s}`);
    console.log("      Estas só voltam quando a suspensão do Blob vencer (~16/10).");
  }

  console.log(APLICAR ? `\n  ${feitas} foto(s) migrada(s).` : "\n(nada foi alterado — rode com --aplicar)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
