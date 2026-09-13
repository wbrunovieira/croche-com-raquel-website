/**
 * Converte para JPEG as fotos que ficaram gravadas em WebP.
 *
 * **Por quê.** O Satori, que desenha as imagens de compartilhamento, não lê
 * WebP: ele ignora a `<img>` em silêncio e a arte sai sem a peça. Medido no ar,
 * correlação de 7 em 7. O `prepararFoto` já não gera mais WebP, mas as fotos
 * subidas antes dessa correção continuam lá — e cada uma é um link que não abre
 * prévia no WhatsApp, que é o canal de venda da Raquel.
 *
 * O site não perde nada: o otimizador do Next reencoda por requisição, e o
 * navegador continua recebendo WebP a partir do JPEG guardado.
 *
 *   npx tsx scripts/converter-fotos-webp.ts          (lista o que faria)
 *   npx tsx scripts/converter-fotos-webp.ts --aplicar
 *
 * Idempotente: rodar de novo não acha nada para fazer.
 */
import { config as carregarEnv } from "dotenv";
import sharp from "sharp";
import { del, put } from "@vercel/blob";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";

carregarEnv({ path: ".env.local", quiet: true });

const APLICAR = process.argv.includes("--aplicar");

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

async function main() {
  const imagens = await db.productImage.findMany({
    where: { url: { endsWith: ".webp" } },
    select: { id: true, url: true, product: { select: { slug: true, name: true } } },
  });

  if (imagens.length === 0) {
    console.log("Nenhuma foto em WebP. Nada a fazer.");
    return;
  }

  console.log(`${imagens.length} foto(s) em WebP:\n`);
  for (const img of imagens) {
    console.log(`  ${img.product.name} — ${img.url.split("/").pop()}`);
    if (!APLICAR) continue;

    const bytes = Buffer.from(await (await fetch(img.url)).arrayBuffer());
    // Qualidade 82: a mesma do `prepararFoto`, para a foto reconvertida não
    // destoar das que a Raquel subir daqui em diante.
    const jpeg = await sharp(bytes).jpeg({ quality: 82, mozjpeg: true }).toBuffer();

    // O caminho no Blob repete o da foto antiga, trocando só a extensão: caminho
    // estável é o que permite rodar isto de novo sem duplicar arquivo.
    const caminho = new URL(img.url).pathname.replace(/^\//, "").replace(/\.webp$/, ".jpg");
    const enviado = await put(caminho, jpeg, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    await db.productImage.update({ where: { id: img.id }, data: { url: enviado.url } });
    await del(img.url);

    const antes = Math.round(bytes.length / 1024);
    const depois = Math.round(jpeg.length / 1024);
    console.log(`      ✓ ${antes} kB (webp) → ${depois} kB (jpeg)`);
  }

  if (!APLICAR) {
    console.log("\n(nada foi alterado — rode com --aplicar)");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
