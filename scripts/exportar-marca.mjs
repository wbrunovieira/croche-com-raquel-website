/**
 * Exporta o logotipo dela em PNG, a partir dos SVGs de `docs/marca/`.
 *
 * **Por que os SVGs são a fonte e não o site.** O logotipo vive como caminho
 * vetorial dentro de um componente React (`src/components/brand/logo.tsx`), com
 * classes de animação e `currentColor` — ou seja, a cor vem do lugar onde ele
 * está, e as classes só existem no navegador. Os arquivos de `docs/marca/` são
 * esse mesmo vetor congelado: sem classe, com cor explícita e com `width`/
 * `height` declarados, que é o que um programa de design espera ao abrir.
 *
 * **Por que PNG e não JPEG.** Fundo transparente. Logotipo com fundo branco
 * chapado colado numa arte colorida é o defeito mais comum de marca mal
 * entregue, e JPEG não guarda transparência.
 *
 * `density: 600` importa: o sharp rasteriza o SVG na densidade pedida ANTES de
 * redimensionar. Com o padrão (72), um PNG de 6000px sairia de um desenho de
 * 450px ampliado — borrado, exatamente o que um vetor existe para evitar.
 *
 *   node scripts/exportar-marca.mjs            → docs/marca/png/
 *   node scripts/exportar-marca.mjs /destino
 */
import sharp from "sharp";
import { readFileSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ORIGEM = "docs/marca";
const DESTINO = process.argv[2] ?? join(ORIGEM, "png");

/**
 * 1000 para WhatsApp e Instagram, 3000 para material impresso comum, 6000 para
 * quando alguém pedir "em alta" sem dizer quanto — a 300dpi dá meio metro de
 * largura, que cobre banner e faixa.
 */
const LARGURAS = [1000, 3000, 6000];

mkdirSync(DESTINO, { recursive: true });

const svgs = readdirSync(ORIGEM).filter((f) => f.endsWith(".svg"));
if (svgs.length === 0) throw new Error(`nenhum .svg em ${ORIGEM}`);

let n = 0;
for (const arquivo of svgs) {
  const base = arquivo.replace(/\.svg$/, "");
  for (const largura of LARGURAS) {
    const saida = join(DESTINO, `${base}-${largura}px.png`);
    const { height } = await sharp(readFileSync(join(ORIGEM, arquivo)), { density: 600 })
      .resize({ width: largura })
      .png({ compressionLevel: 9 })
      .toFile(saida);
    console.log(`  ${base}-${largura}px.png  ${largura}×${height}`);
    n++;
  }
}
console.log(`\n✓ ${n} arquivo(s) em ${DESTINO}/ — fundo transparente`);
