/**
 * Sobe ao Vercel Blob as fotos de `prisma/fotos/` e liga cada uma à sua peça.
 *
 * Fica separado do seed de propósito: o seed grava linha de banco e roda em
 * segundos; isto atravessa a rede e mexe em armazenamento pago. Misturar os
 * dois faria toda migração de conteúdo pagar upload de novo.
 *
 *   pnpm db:seed && pnpm fotos:importar
 *
 * É idempotente. O caminho no Blob é fixo (`produtos/<slug>/<arquivo>`), sem o
 * sufixo aleatório que o painel usa: aqui o arquivo tem dono conhecido e um
 * caminho estável é o que permite rodar de novo sem duplicar. Rodar duas vezes
 * regrava a mesma foto no mesmo lugar.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { config as carregarEnv } from "dotenv";
import { put } from "@vercel/blob";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";
import { PRODUTOS } from "../prisma/catalogo";

carregarEnv({ path: ".env.local", quiet: true });

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

const PASTA = join(process.cwd(), "prisma", "fotos");

/**
 * Foto da faixa "quem faz".
 *
 * É um retrato provisório: o que existe hoje é o crochê em andamento, porque
 * não há foto utilizável da Raquel no acervo. Ela troca pelo painel, e por
 * isso o import **não sobrescreve** uma foto já cadastrada.
 */
const QUEM_FAZ = {
  arquivo: "quem-faz.jpg",
  alt: "Peça de crochê em andamento, em fio rosa, com a agulha ainda no ponto",
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Falta BLOB_READ_WRITE_TOKEN. Rode `vercel env pull .env.local`.");
  }

  let enviadas = 0;
  let reaproveitadas = 0;

  for (const p of PRODUTOS) {
    const produto = await db.product.findUnique({
      where: { slug: p.slug },
      select: { id: true },
    });
    if (!produto) {
      console.warn(`· ${p.slug}: peça não está no banco. Rode \`pnpm db:seed\` antes.`);
      continue;
    }

    for (const [i, foto] of p.fotos.entries()) {
      const caminho = `produtos/${p.slug}/${foto.arquivo}`;
      const existente = await db.productImage.findFirst({
        where: { productId: produto.id, url: { contains: caminho } },
      });

      if (existente) {
        // A foto já está no Blob: só reafirma o texto alternativo e a ordem,
        // que são o que costuma mudar quando a gente revisa o catálogo.
        await db.productImage.update({
          where: { id: existente.id },
          data: { alt: foto.alt, position: i, hasHumanScale: foto.escalaHumana ?? false },
        });
        reaproveitadas++;
        continue;
      }

      const arquivo = await readFile(join(PASTA, foto.arquivo));
      const enviado = await put(caminho, arquivo, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "image/jpeg",
      });

      await db.productImage.create({
        data: {
          productId: produto.id,
          url: enviado.url,
          alt: foto.alt,
          position: i,
          hasHumanScale: foto.escalaHumana ?? false,
        },
      });
      enviadas++;
      console.log(`✓ ${p.slug} — ${foto.arquivo}`);
    }
  }

  const config = await db.siteSettings.findUniqueOrThrow({
    where: { id: "singleton" },
    select: { aboutImageUrl: true },
  });
  if (config.aboutImageUrl) {
    console.log("· quem faz: já tem foto cadastrada, mantida como está.");
  } else {
    const arquivo = await readFile(join(PASTA, QUEM_FAZ.arquivo));
    const enviado = await put(`site/quem-faz/${QUEM_FAZ.arquivo}`, arquivo, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "image/jpeg",
    });
    await db.siteSettings.update({
      where: { id: "singleton" },
      data: { aboutImageUrl: enviado.url, aboutImageAlt: QUEM_FAZ.alt },
    });
    enviadas++;
    console.log(`✓ quem faz — ${QUEM_FAZ.arquivo}`);
  }

  const semFoto = await db.product.count({ where: { images: { none: {} } } });
  console.log(
    `\n${enviadas} foto(s) enviada(s), ${reaproveitadas} já estava(m) no Blob.` +
      (semFoto > 0 ? ` ${semFoto} peça(s) ainda sem foto.` : " Toda peça tem foto.")
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
