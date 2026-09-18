/**
 * Migra a ÚNICA foto do site que não é de peça: o retrato da Raquel na seção
 * "Quem faz" (`siteSettings.aboutImageUrl`).
 *
 * Ela escapou da migração do acervo porque aquela varre `ProductImage`, e este
 * endereço mora noutra tabela. O site quebrou com 500 na home ao pedir uma
 * imagem do Blob suspenso — e só apareceu porque a liberação do domínio do Blob
 * saiu do `next.config.ts`. Enquanto a liberação existia, a home carregava com
 * o retrato quebrado, em silêncio.
 *
 * Roda uma vez. Depois disso não sobra endereço de Blob em lugar nenhum.
 */
import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { r2Enviar } from "@/lib/r2";
import { urlComSslVerificado } from "../src/lib/db-url";

config({ path: ".env.local" });

async function main() {
  const copia = process.argv[2];
  const aplicar = process.argv.includes("--aplicar");
  if (!copia) throw new Error("uso: npx tsx scripts/migrar-retrato.ts <arquivo> [--aplicar]");

  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
  });

  const ajustes = await db.siteSettings.findFirst({ select: { id: true, aboutImageUrl: true } });
  const atual = ajustes?.aboutImageUrl;
  if (!atual || !atual.includes("blob.vercel-storage.com")) {
    console.log(`nada a migrar — aboutImageUrl = ${atual ?? "(vazio)"}`);
    return db.$disconnect();
  }

  const chave = `croche${new URL(atual).pathname}`;
  const bytes = await readFile(copia);
  console.log(`  ${atual.slice(-50)}\n  → /fotos/${chave}  (${(bytes.length / 1024).toFixed(0)} kB)`);

  if (!aplicar) {
    console.log("\n(nada foi alterado — rode com --aplicar)");
    return db.$disconnect();
  }

  const endereco = await r2Enviar(
    chave,
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    "image/jpeg"
  );
  // Só grava no banco DEPOIS do envio dar certo: se o upload falhar, o endereço
  // antigo continua lá e a próxima execução tenta de novo.
  await db.siteSettings.update({ where: { id: ajustes.id }, data: { aboutImageUrl: endereco } });
  console.log(`\n  retrato migrado.`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});