/**
 * Tira das peças REAIS o que elas herdaram das peças de exemplo.
 *
 * **O que aconteceu.** A Raquel transformou demonstrações em peças de verdade
 * pelo painel: trocou o nome e subiu as fotos dela. O que ela não trocou ficou —
 * e o que ficou é texto de exemplo publicado numa peça real. O "Jogo de
 * banheiro", com onze fotos dela, dizia à cliente *"Peça de exemplo, só para
 * mostrar como esta categoria aparece no site"*.
 *
 * **O que este script corrige, e por quê cada um.**
 *
 * *A descrição* vira um texto neutro e verdadeiro — não inventa nada sobre a
 * peça, só afirma o que vale para tudo o que ela faz. **Não é a descrição
 * definitiva:** quem escreve isso é ela, e a issue está aberta. É o texto que
 * fica até lá, porque o aviso de exemplo não pode ficar.
 *
 * *O texto alternativo das fotos* vinha do slug antigo — a foto do jogo de
 * banheiro estava descrita como "exemplo manta de sofa". Isso não é só SEO: é o
 * que um leitor de tela anuncia. Passa a ser o nome da peça, que é uma
 * descrição pobre mas verdadeira, e verdadeira é o mínimo.
 *
 * **O que este script NÃO toca, de propósito:** material e categoria. O "Jogo de
 * cozinha" está em Macramê porque o exemplo que ela editou era o suporte de
 * planta — mas só ela sabe de que fio cada peça é feita e onde ela quer que
 * apareça. Adivinhar isso seria inventar ficha técnica de artesã.
 *
 *   npx tsx scripts/limpar-heranca-de-exemplo.ts            (lista)
 *   npx tsx scripts/limpar-heranca-de-exemplo.ts --aplicar
 */
import { config as carregarEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";
import { ehDemonstracao } from "../src/lib/demonstracao";

carregarEnv({ path: ".env.local", quiet: true });
const APLICAR = process.argv.includes("--aplicar");

/**
 * O texto de espera.
 *
 * Cada afirmação aqui vale para QUALQUER peça que ela faça, e está dita com as
 * palavras que o site já usa: feito à mão, uma de cada vez, sob encomenda, cor e
 * tamanho à escolha, prazo combinado na conversa. Nada aqui descreve esta peça —
 * e é justamente por isso que pode entrar sem ela.
 */
const TEXTO_DE_ESPERA =
  "Peça feita à mão, uma de cada vez. Você escolhe a cor e o tamanho, e a gente " +
  "combina o prazo na conversa — me chame no WhatsApp que eu conto os detalhes.";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

async function main() {
  const pecas = await db.product.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      material: true,
      category: { select: { name: true } },
      images: {
        orderBy: { position: "asc" },
        select: { id: true, url: true, alt: true },
      },
    },
    orderBy: { name: "asc" },
  });

  let mexidas = 0;

  for (const p of pecas) {
    const real = !ehDemonstracao(p.images[0]?.url);
    const descricaoHerdada = p.description.startsWith("Peça de exemplo");
    const altsHerdados = p.images.filter((i) => i.alt.startsWith("exemplo "));

    if (!real || (!descricaoHerdada && altsHerdados.length === 0)) continue;

    mexidas++;
    console.log(`\n  ${p.name}  [${p.category.name}]`);

    if (descricaoHerdada) {
      console.log("      descrição: texto de exemplo → texto de espera");
      if (APLICAR) {
        await db.product.update({ where: { id: p.id }, data: { description: TEXTO_DE_ESPERA } });
      }
    }

    for (const img of altsHerdados) {
      console.log(`      alt: "${img.alt}" → "${p.name}"`);
      if (APLICAR) {
        await db.productImage.update({ where: { id: img.id }, data: { alt: p.name } });
      }
    }

    console.log(`      ⚠ conferir com ela: material "${p.material ?? "—"}" e categoria "${p.category.name}" vieram do exemplo`);
  }

  if (mexidas === 0) {
    console.log("Nenhuma peça real carrega herança de exemplo. Nada a fazer.");
  } else if (!APLICAR) {
    console.log("\n(nada foi alterado — rode com --aplicar)");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
