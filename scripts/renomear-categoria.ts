/**
 * Renomeia uma categoria mantendo as peças dentro dela.
 *
 * Existe porque o seed faz `upsert` **por slug**: mudar o slug no catálogo cria
 * uma categoria nova e deixa a antiga órfã, com as peças dentro. Renomear a
 * linha ANTES de semear leva as peças junto.
 *
 *   npx tsx scripts/renomear-categoria.ts mesa-posta mesa Mesa
 */
import { config as carregarEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";

carregarEnv({ path: ".env.local", quiet: true });

const [slugAntigo, slugNovo, nomeNovo] = process.argv.slice(2);
if (!slugAntigo || !slugNovo || !nomeNovo) {
  console.error("uso: npx tsx scripts/renomear-categoria.ts <slug-antigo> <slug-novo> <Nome>");
  process.exit(1);
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

async function main() {
  const antiga = await db.category.findUnique({
    where: { slug: slugAntigo },
    include: { _count: { select: { products: true } } },
  });

  if (!antiga) {
    console.log(`nada a fazer: não existe categoria com slug "${slugAntigo}"`);
  } else {
    await db.category.update({
      where: { id: antiga.id },
      data: { slug: slugNovo, name: nomeNovo },
    });
    console.log(
      `✓ ${slugAntigo} → ${slugNovo} ("${nomeNovo}") — ${antiga._count.products} peças vieram junto`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
