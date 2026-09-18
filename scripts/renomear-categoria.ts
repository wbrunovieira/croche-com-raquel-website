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

const APLICAR = process.argv.includes("--aplicar");

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
    return;
  }

  /**
   * **Mostra o que vai sobrescrever, e exige `--aplicar`.**
   *
   * Era o único script de escrita do projeto sem ensaio: renomeava direto, sem
   * dizer o valor atual. E renomear em cima do que ela mudou é exatamente o
   * acidente que já aconteceu aqui — o seed devolveu "Sousplat de Folhas" por
   * cima do "Sousplat" que ela tinha escolhido no painel. Ver o nome antigo
   * antes de trocar é o que dá a chance de perceber.
   */
  console.log(`  nome:  "${antiga.name}"  →  "${nomeNovo}"`);
  console.log(`  slug:  "${antiga.slug}"  →  "${slugNovo}"`);
  console.log(`  peças que vêm junto: ${antiga._count.products}`);

  if (!APLICAR) {
    console.log("\n(nada foi alterado — rode com --aplicar)");
    return;
  }

  await db.category.update({
    where: { id: antiga.id },
    data: { slug: slugNovo, name: nomeNovo },
  });
  console.log(`\n✓ renomeada.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
