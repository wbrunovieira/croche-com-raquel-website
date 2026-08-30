"use server";

import { del, put } from "@vercel/blob";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { slugUnico } from "@/lib/admin/slug";
import { revalidarCatalogo, revalidarProduto } from "@/lib/revalidar";

/** Campo de número que aceita vazio — "" vira null, não 0. */
const numeroOpcional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .refine((n) => n === null || (Number.isInteger(n) && n > 0), {
    message: "Use um número inteiro maior que zero, ou deixe em branco.",
  });

const textoOpcional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v));

const esquemaDeProduto = z.object({
  name: z.string().trim().min(2, "O nome precisa de pelo menos 2 letras."),
  description: z.string().trim().min(10, "Escreva uma descrição."),
  // Preço vazio significa "sob consulta". Nunca vira 0.
  price: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v.replace(",", "."))))
    .refine((n) => n === null || (Number.isFinite(n) && n >= 0), {
      message: "Preço inválido. Deixe em branco para “sob consulta”.",
    }),
  dimensions: textoOpcional,
  material: textoOpcional,
  capacity: textoOpcional,
  careText: textoOpcional,
  productionDaysMin: numeroOpcional,
  productionDaysMax: numeroOpcional,
  categoryId: z.string().min(1, "Escolha a categoria."),
  subcategoryId: textoOpcional,
  status: z.enum(["DRAFT", "PUBLISHED"]),
  featured: z.coerce.boolean(),
  featuredPosition: numeroOpcional,
  position: z.coerce.number().int().min(0).catch(0),
});

export type ResultadoDaAcao = { erro?: string; ok?: string };

export async function criarProduto(_anterior: unknown, dados: FormData) {
  await exigirSessao();

  const nome = String(dados.get("name") ?? "").trim();
  const categoryId = String(dados.get("categoryId") ?? "");
  if (nome.length < 2) return { erro: "Dê um nome para a peça." };
  if (!categoryId) return { erro: "Escolha a categoria." };

  const slug = await slugUnico(nome, async (candidato) =>
    Boolean(
      await db.product.findUnique({ where: { slug: candidato }, select: { id: true } })
    )
  );

  const produto = await db.product.create({
    data: {
      slug,
      name: nome,
      description: "",
      categoryId,
      // Nasce como rascunho: peça sem foto e sem descrição não deve ir ao ar
      // por um clique.
      status: "DRAFT",
    },
  });

  redirect(`/admin/produtos/${produto.id}`);
}

export async function salvarProduto(
  _anterior: unknown,
  dados: FormData
): Promise<ResultadoDaAcao> {
  await exigirSessao();
  const id = String(dados.get("id") ?? "");
  if (!id) return { erro: "Peça não encontrada." };

  // Lido campo a campo, e não com Object.fromEntries: um campo que só existe
  // na tela sob condição — featuredPosition aparece apenas com "destaque"
  // marcado — simplesmente não vem no FormData, e o esquema receberia
  // `undefined` onde espera texto.
  const texto = (chave: string) => String(dados.get(chave) ?? "");
  const analise = esquemaDeProduto.safeParse({
    name: texto("name"),
    description: texto("description"),
    price: texto("price"),
    dimensions: texto("dimensions"),
    material: texto("material"),
    capacity: texto("capacity"),
    careText: texto("careText"),
    productionDaysMin: texto("productionDaysMin"),
    productionDaysMax: texto("productionDaysMax"),
    categoryId: texto("categoryId"),
    subcategoryId: texto("subcategoryId"),
    status: texto("status"),
    featured: dados.get("featured") === "on",
    featuredPosition: texto("featuredPosition"),
    position: texto("position"),
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }
  const v = analise.data;

  if (
    v.productionDaysMin !== null &&
    v.productionDaysMax !== null &&
    v.productionDaysMin > v.productionDaysMax
  ) {
    return { erro: "O prazo mínimo não pode ser maior que o máximo." };
  }

  if (v.status === "PUBLISHED") {
    const fotos = await db.productImage.count({ where: { productId: id } });
    if (fotos === 0) {
      return {
        erro: "Esta peça não tem foto. Adicione pelo menos uma antes de publicar.",
      };
    }
  }

  const produto = await db.product.update({
    where: { id },
    data: {
      ...v,
      subcategoryId: v.subcategoryId || null,
      featuredPosition: v.featured ? (v.featuredPosition ?? 0) : null,
    },
    select: { slug: true },
  });

  // Grupos de opção: a lista chega como "grupoId:obrigatorio" e os valores
  // como "valorId" marcados. Regravar tudo é mais simples e mais seguro que
  // tentar casar o que mudou.
  const gruposEscolhidos = dados.getAll("grupo").map(String);
  await db.productOptionGroup.deleteMany({
    where: { productId: id, groupId: { notIn: gruposEscolhidos } },
  });

  for (const [i, groupId] of gruposEscolhidos.entries()) {
    const obrigatorio = dados.get(`obrigatorio-${groupId}`) === "on";
    const pog = await db.productOptionGroup.upsert({
      where: { productId_groupId: { productId: id, groupId } },
      update: { required: obrigatorio, position: i },
      create: { productId: id, groupId, required: obrigatorio, position: i },
    });

    const valores = dados.getAll(`valor-${groupId}`).map(String);
    await db.productOptionValue.deleteMany({
      where: { productOptionGroupId: pog.id, optionValueId: { notIn: valores } },
    });
    for (const [j, optionValueId] of valores.entries()) {
      await db.productOptionValue.upsert({
        where: {
          productOptionGroupId_optionValueId: {
            productOptionGroupId: pog.id,
            optionValueId,
          },
        },
        update: { position: j },
        create: { productOptionGroupId: pog.id, optionValueId, position: j },
      });
    }
  }

  revalidarProduto(produto.slug);
  return { ok: "Peça salva." };
}

export async function apagarProduto(id: string) {
  await exigirSessao();

  const produto = await db.product.findUnique({
    where: { id },
    select: { slug: true, images: { select: { url: true } } },
  });
  if (!produto) return;

  // As fotos saem do armazenamento junto: sem isto elas ficariam pagando
  // espaço para sempre, sem nada apontando para elas.
  await Promise.allSettled(produto.images.map((i) => del(i.url)));
  await db.product.delete({ where: { id } });

  revalidarProduto(produto.slug);
  redirect("/admin/produtos");
}

const TIPOS_DE_IMAGEM = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const TAMANHO_MAXIMO = 15 * 1024 * 1024;

export async function enviarImagem(
  _anterior: unknown,
  dados: FormData
): Promise<ResultadoDaAcao> {
  await exigirSessao();

  const productId = String(dados.get("productId") ?? "");
  const arquivo = dados.get("arquivo");

  if (!productId || !(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Escolha uma foto." };
  }
  if (!TIPOS_DE_IMAGEM.includes(arquivo.type)) {
    return { erro: "Use uma foto em JPG, PNG, WebP ou AVIF." };
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return { erro: "A foto passa de 15 MB. Reduza antes de enviar." };
  }

  const produto = await db.product.findUnique({
    where: { id: productId },
    select: { slug: true, _count: { select: { images: true } } },
  });
  if (!produto) return { erro: "Peça não encontrada." };

  const enviado = await put(`produtos/${produto.slug}/${arquivo.name}`, arquivo, {
    access: "public",
    // Nome com sufixo aleatório: duas fotos com o mesmo nome não se
    // sobrescrevem, e o cache do navegador não entrega a antiga.
    addRandomSuffix: true,
  });

  await db.productImage.create({
    data: {
      productId,
      url: enviado.url,
      alt: String(dados.get("alt") ?? "").trim() || produto.slug.replace(/-/g, " "),
      position: produto._count.images,
      hasHumanScale: dados.get("escalaHumana") === "on",
    },
  });

  revalidarProduto(produto.slug);
  return { ok: "Foto adicionada." };
}

export async function apagarImagem(imageId: string) {
  await exigirSessao();
  const imagem = await db.productImage.findUnique({
    where: { id: imageId },
    select: { url: true, product: { select: { slug: true } } },
  });
  if (!imagem) return;

  await Promise.allSettled([del(imagem.url)]);
  await db.productImage.delete({ where: { id: imageId } });
  revalidarProduto(imagem.product.slug);
}

export async function moverImagem(imageId: string, direcao: -1 | 1) {
  await exigirSessao();
  const atual = await db.productImage.findUnique({ where: { id: imageId } });
  if (!atual) return;

  const vizinha = await db.productImage.findFirst({
    where: {
      productId: atual.productId,
      position: direcao === -1 ? { lt: atual.position } : { gt: atual.position },
    },
    orderBy: { position: direcao === -1 ? "desc" : "asc" },
  });
  if (!vizinha) return;

  await db.$transaction([
    db.productImage.update({ where: { id: atual.id }, data: { position: vizinha.position } }),
    db.productImage.update({ where: { id: vizinha.id }, data: { position: atual.position } }),
  ]);

  const produto = await db.product.findUnique({
    where: { id: atual.productId },
    select: { slug: true },
  });
  if (produto) revalidarProduto(produto.slug);
}

export async function alternarEscalaHumana(imageId: string, valor: boolean) {
  await exigirSessao();
  const imagem = await db.productImage.update({
    where: { id: imageId },
    data: { hasHumanScale: valor },
    select: { product: { select: { slug: true } } },
  });
  revalidarProduto(imagem.product.slug);
}

export async function duplicarProduto(id: string) {
  await exigirSessao();
  const original = await db.product.findUnique({
    where: { id },
    include: { optionGroups: { include: { values: true } } },
  });
  if (!original) return;

  const slug = await slugUnico(`${original.name} copia`, async (candidato) =>
    Boolean(
      await db.product.findUnique({ where: { slug: candidato }, select: { id: true } })
    )
  );

  const copia = await db.product.create({
    data: {
      slug,
      name: `${original.name} (cópia)`,
      description: original.description,
      price: original.price,
      dimensions: original.dimensions,
      material: original.material,
      capacity: original.capacity,
      careText: original.careText,
      productionDaysMin: original.productionDaysMin,
      productionDaysMax: original.productionDaysMax,
      categoryId: original.categoryId,
      subcategoryId: original.subcategoryId,
      // A cópia nasce rascunho e sem destaque: duplicar é ponto de partida,
      // não publicação.
      status: "DRAFT",
      featured: false,
    },
  });

  for (const og of original.optionGroups) {
    const novo = await db.productOptionGroup.create({
      data: {
        productId: copia.id,
        groupId: og.groupId,
        required: og.required,
        position: og.position,
      },
    });
    await db.productOptionValue.createMany({
      data: og.values.map((v) => ({
        productOptionGroupId: novo.id,
        optionValueId: v.optionValueId,
        position: v.position,
      })),
    });
  }

  revalidarCatalogo();
  redirect(`/admin/produtos/${copia.id}`);
}
