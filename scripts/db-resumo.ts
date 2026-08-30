/**
 * Resumo do catálogo direto do banco. Serve para conferir o estado dos dados
 * sem abrir o Prisma Studio, e para provar que o modelo de opções responde à
 * consulta que a página de produto vai fazer.
 *
 *   pnpm db:resumo            resumo geral
 *   pnpm db:resumo bolsa-serra  detalha um produto pelo slug
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";

config({ path: ".env.local", quiet: true });

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

const preco = (v: unknown) => (v === null ? "sob consulta" : `R$ ${String(v)}`);

async function detalhar(slug: string) {
  const p = await db.product.findUniqueOrThrow({
    where: { slug },
    include: {
      category: true,
      subcategory: true,
      optionGroups: {
        orderBy: { position: "asc" },
        include: {
          group: true,
          values: { orderBy: { position: "asc" }, include: { optionValue: true } },
        },
      },
    },
  });

  console.log(`\n${p.name}  —  ${p.category.name}${p.subcategory ? ` / ${p.subcategory.name}` : ""}`);
  console.log(`  preço: ${preco(p.price)}`);
  console.log(`  prazo: ${p.productionDaysMin}–${p.productionDaysMax} dias`);
  console.log(`  medidas: ${p.dimensions ?? "—"}`);
  if (p.capacity) console.log(`  capacidade: ${p.capacity}`);
  console.log("  opções:");
  for (const og of p.optionGroups) {
    const valores = og.values
      .map((v) => v.optionValue.name + (v.optionValue.hex ? ` (${v.optionValue.hex})` : ""))
      .join(", ");
    console.log(
      `    ${og.group.name} [${og.group.type}]${og.required ? " obrigatório" : ""}: ` +
        (valores || "texto livre")
    );
  }
}

async function main() {
  const alvo = process.argv[2];
  if (alvo) {
    await detalhar(alvo);
    return;
  }

  const categorias = await db.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true, subcategories: true } } },
  });
  console.log("CATEGORIAS");
  for (const c of categorias) {
    console.log(
      `  ${c.name.padEnd(20)} ${String(c._count.products).padStart(2)} produtos` +
        (c._count.subcategories ? `  ·  ${c._count.subcategories} subcategorias` : "")
    );
  }

  const grupos = await db.optionGroup.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { values: true, products: true } } },
  });
  console.log("\nGRUPOS DE OPÇÃO");
  for (const g of grupos) {
    console.log(
      `  ${g.name.padEnd(20)} ${g.type.padEnd(9)} ${String(g._count.values).padStart(2)} valores` +
        `  ·  usado em ${g._count.products} produtos`
    );
  }

  const [comPreco, semPreco] = await Promise.all([
    db.product.count({ where: { price: { not: null } } }),
    db.product.count({ where: { price: null } }),
  ]);
  const destaques = await db.product.findMany({
    where: { featured: true, status: "PUBLISHED" },
    orderBy: { featuredPosition: "asc" },
    select: { name: true },
  });
  console.log(`\nPREÇO       ${comPreco} com valor  ·  ${semPreco} sob consulta`);
  console.log(`DESTAQUES   ${destaques.map((d) => d.name).join(" · ")}`);

  await detalhar("bolsa-serra");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
