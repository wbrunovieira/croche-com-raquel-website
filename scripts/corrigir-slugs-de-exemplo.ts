/**
 * Devolve um endereço decente às peças que deixaram de ser exemplo.
 *
 * **O que aconteceu.** A Raquel transformou peças de demonstração em peças reais
 * pelo painel: trocou nome e fotos. Mas o slug é gerado UMA vez, na criação, e
 * não muda ao renomear — imutabilidade de propósito, para não quebrar link que
 * já circulou. Resultado: o "Jogo de banheiro", com onze fotos dela, mora em
 * `/produtos/exemplo-manta-de-sofa`.
 *
 * Trocar o slug é seguro **só aqui e só agora**: o domínio ainda mostra a obra,
 * então nenhuma dessas URLs foi compartilhada com ninguém. Depois da estreia,
 * mudar slug quebra link e não se faz sem redirecionamento.
 *
 * O critério é o mesmo de `lib/demonstracao.ts`: peça cuja capa não é mais a
 * foto de exemplo deixou de ser demonstração.
 *
 *   npx tsx scripts/corrigir-slugs-de-exemplo.ts            (lista)
 *   npx tsx scripts/corrigir-slugs-de-exemplo.ts --aplicar
 */
import { config as carregarEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";
import { slugUnico } from "../src/lib/admin/slug";
import { ehDemonstracao } from "../src/lib/demonstracao";

carregarEnv({ path: ".env.local", quiet: true });
const APLICAR = process.argv.includes("--aplicar");

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

async function main() {
  const pecas = await db.product.findMany({
    where: { slug: { startsWith: "exemplo-" } },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    },
  });

  const viraram = pecas.filter((p) => !ehDemonstracao(p.images[0]?.url));

  if (viraram.length === 0) {
    console.log("Nenhuma peça de exemplo virou peça real. Nada a fazer.");
    return;
  }

  for (const p of viraram) {
    const novo = await slugUnico(p.name, async (candidato) =>
      Boolean(await db.product.findUnique({ where: { slug: candidato }, select: { id: true } }))
    );
    console.log(`  ${p.name}`);
    console.log(`      ${p.slug}  →  ${novo}`);

    if (p.description.startsWith("Peça de exemplo")) {
      console.log("      ⚠ a descrição ainda é a de exemplo — quem escreve é a Raquel");
    }

    if (APLICAR) {
      await db.product.update({ where: { id: p.id }, data: { slug: novo } });
    }
  }

  if (!APLICAR) console.log("\n(nada foi alterado — rode com --aplicar)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
