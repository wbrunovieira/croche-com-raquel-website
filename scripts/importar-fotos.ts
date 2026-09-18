/**
 * Sobe ao Cloudflare R2 as fotos de `prisma/fotos/` e liga cada uma à sua peça.
 *
 * Fica separado do seed de propósito: o seed grava linha de banco e roda em
 * segundos; isto atravessa a rede e mexe em armazenamento pago. Misturar os
 * dois faria toda migração de conteúdo pagar upload de novo.
 *
 *   pnpm fotos:importar             → mostra o que faria
 *   pnpm fotos:importar --aplicar   → envia de verdade
 *
 * **O ensaio não existia, e custou caro.** Em 18/09/2026 rodei este script
 * achando que ele listaria o que faria; ele enviou quatro fotos e as ligou a
 * peças reais dela, que não as tinham. Foi preciso apagar as linhas e conferir
 * contra o backup. Todo script que escreve neste projeto tem `--aplicar`; este
 * era o que faltava.
 *
 * É idempotente. A chave é fixa (`croche/produtos/<slug>/<arquivo>`), sem o
 * sufixo aleatório que o painel usa: aqui o arquivo tem dono conhecido e um
 * caminho estável é o que permite rodar de novo sem duplicar. Rodar duas vezes
 * regrava a mesma foto no mesmo lugar.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { config as carregarEnv } from "dotenv";
import { r2Configurado, r2Enviar } from "../src/lib/r2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";
import { PRODUTOS } from "../prisma/catalogo";

carregarEnv({ path: ".env.local", quiet: true });

const APLICAR = process.argv.includes("--aplicar");

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
  /**
   * **O guarda aponta para o armazenamento ATUAL.**
   *
   * Ele conferia `BLOB_READ_WRITE_TOKEN`, e esse token continuou no `.env.local`
   * depois da migração para o R2 — ou seja, o guarda passava e o script seguia
   * escrevendo num armazenamento suspenso. Se o Blob respondesse 200 com corpo
   * de erro (foi exatamente o que produziu os 22 bytes de "Your store is
   * blocked" no backup), ele gravaria endereços mortos por cima do acervo dela.
   */
  if (!APLICAR) {
    console.log("(ensaio — nada será enviado. Rode com --aplicar para valer.)\n");
  }

  if (APLICAR && !r2Configurado()) {
    throw new Error("Faltam as variáveis do R2 no .env.local.");
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
      // `croche/` porque o bucket é compartilhado com outros projetos do time.
      const caminho = `croche/produtos/${p.slug}/${foto.arquivo}`;
      const existente = await db.productImage.findFirst({
        where: { productId: produto.id, url: { contains: caminho } },
      });

      if (existente) {
        // A foto já está no armazenamento: só reafirma o texto alternativo e a ordem,
        // que são o que costuma mudar quando a gente revisa o catálogo.
        await db.productImage.update({
          where: { id: existente.id },
          data: { alt: foto.alt, position: i, hasHumanScale: foto.escalaHumana ?? false },
        });
        reaproveitadas++;
        continue;
      }

      if (!APLICAR) {
        console.log(`· ${p.slug} — enviaria ${foto.arquivo}`);
        continue;
      }

      const arquivo = await readFile(join(PASTA, foto.arquivo));
      const url = await r2Enviar(
        caminho,
        arquivo.buffer.slice(
          arquivo.byteOffset,
          arquivo.byteOffset + arquivo.byteLength
        ) as ArrayBuffer,
        "image/jpeg"
      );
      const enviado = { url };

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
    if (!APLICAR) {
      console.log(`· quem faz — enviaria ${QUEM_FAZ.arquivo}`);
    } else {
    const arquivo = await readFile(join(PASTA, QUEM_FAZ.arquivo));
    const url = await r2Enviar(
      `croche/site/quem-faz/${QUEM_FAZ.arquivo}`,
      arquivo.buffer.slice(
        arquivo.byteOffset,
        arquivo.byteOffset + arquivo.byteLength
      ) as ArrayBuffer,
      "image/jpeg"
    );
    const enviado = { url };
    await db.siteSettings.update({
      where: { id: "singleton" },
      data: { aboutImageUrl: enviado.url, aboutImageAlt: QUEM_FAZ.alt },
    });
    enviadas++;
    console.log(`✓ quem faz — ${QUEM_FAZ.arquivo}`);
    }
  }

  const semFoto = await db.product.count({ where: { images: { none: {} } } });
  console.log(
    `\n${enviadas} foto(s) enviada(s), ${reaproveitadas} já estava(m) no armazenamento.` +
      (semFoto > 0 ? ` ${semFoto} peça(s) ainda sem foto.` : " Toda peça tem foto.")
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
