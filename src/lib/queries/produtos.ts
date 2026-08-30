import { db } from "@/lib/db";
import {
  SLUG_BOLSAS,
  type ImagemDeProduto,
  type ProdutoDetalhe,
  type ProdutoResumo,
} from "./tipos";

/**
 * Consultas de produto.
 *
 * Duas regras valem em todas elas:
 *  - só produto `PUBLISHED` chega ao site; rascunho é da Raquel;
 *  - grupo e valor de opção desligados (`active: false`) não aparecem. É assim
 *    que ela tira uma cor do ar quando acaba o fio, sem perder o vínculo.
 */

const imagensOrdenadas = {
  orderBy: { position: "asc" },
} as const;

const selecaoResumo = {
  id: true,
  slug: true,
  name: true,
  price: true,
  category: { select: { slug: true, name: true } },
  subcategory: { select: { slug: true, name: true } },
  images: { ...imagensOrdenadas, take: 1 },
} as const;

type LinhaImagem = { id: string; url: string; alt: string; hasHumanScale: boolean };

function paraImagem(i: LinhaImagem): ImagemDeProduto {
  return { id: i.id, url: i.url, alt: i.alt, temEscalaHumana: i.hasHumanScale };
}

type LinhaResumo = {
  id: string;
  slug: string;
  name: string;
  price: unknown;
  category: { slug: string; name: string };
  subcategory: { slug: string; name: string } | null;
  images: LinhaImagem[];
};

function paraResumo(p: LinhaResumo): ProdutoResumo {
  return {
    id: p.id,
    slug: p.slug,
    nome: p.name,
    // Decimal -> number. Nulo continua nulo: é "sob consulta", não zero.
    preco: p.price === null ? null : Number(p.price),
    categoria: { slug: p.category.slug, nome: p.category.name },
    subcategoria: p.subcategory
      ? { slug: p.subcategory.slug, nome: p.subcategory.name }
      : null,
    ehBolsa: p.category.slug === SLUG_BOLSAS,
    capa: p.images[0] ? paraImagem(p.images[0]) : null,
  };
}

export async function listarProdutos(opcoes?: {
  categoria?: string;
  subcategoria?: string;
  colecao?: string;
}): Promise<ProdutoResumo[]> {
  const linhas = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      ...(opcoes?.categoria ? { category: { slug: opcoes.categoria } } : {}),
      ...(opcoes?.subcategoria ? { subcategory: { slug: opcoes.subcategoria } } : {}),
      ...(opcoes?.colecao
        ? { collections: { some: { slug: opcoes.colecao, active: true } } }
        : {}),
    },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: selecaoResumo,
  });
  return linhas.map(paraResumo);
}

/** Vitrine da home. A ordem é curadoria da Raquel, não cálculo. */
export async function listarDestaques(limite = 8): Promise<ProdutoResumo[]> {
  const linhas = await db.product.findMany({
    where: { status: "PUBLISHED", featured: true },
    orderBy: [{ featuredPosition: "asc" }, { name: "asc" }],
    take: limite,
    select: selecaoResumo,
  });
  return linhas.map(paraResumo);
}

export async function buscarProdutoPorSlug(
  slug: string
): Promise<ProdutoDetalhe | null> {
  const p = await db.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      ...selecaoResumo,
      images: imagensOrdenadas,
      description: true,
      dimensions: true,
      material: true,
      capacity: true,
      careText: true,
      productionDaysMin: true,
      productionDaysMax: true,
      optionGroups: {
        where: { group: { active: true } },
        orderBy: { position: "asc" },
        select: {
          required: true,
          group: { select: { id: true, slug: true, name: true, type: true } },
          values: {
            // Valor desligado some do site, mas o vínculo continua no banco.
            where: { optionValue: { active: true } },
            orderBy: { position: "asc" },
            select: {
              optionValue: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  hex: true,
                  yarnLine: true,
                  yarnColorCode: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!p) return null;

  return {
    ...paraResumo(p),
    descricao: p.description,
    medidas: p.dimensions,
    material: p.material,
    capacidade: p.capacity,
    cuidados: p.careText,
    prazoMinDias: p.productionDaysMin,
    prazoMaxDias: p.productionDaysMax,
    imagens: p.images.map(paraImagem),
    grupos: p.optionGroups
      // Um grupo de escolha que ficou sem valor disponível não deve virar um
      // seletor vazio na tela. Grupo de texto livre nunca tem valores.
      .filter((og) => og.group.type === "TEXT" || og.values.length > 0)
      .map((og) => ({
        id: og.group.id,
        slug: og.group.slug,
        nome: og.group.name,
        tipo: og.group.type,
        obrigatorio: og.required,
        valores: og.values.map((v) => ({
          id: v.optionValue.id,
          slug: v.optionValue.slug,
          nome: v.optionValue.name,
          hex: v.optionValue.hex,
          linhaDoFio: v.optionValue.yarnLine,
          codigoDaCor: v.optionValue.yarnColorCode,
        })),
      })),
  };
}

/** "Combina com": mesma categoria, fora a peça atual. */
export async function listarRelacionados(
  produto: ProdutoResumo,
  limite = 4
): Promise<ProdutoResumo[]> {
  const linhas = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: produto.id },
      category: { slug: produto.categoria.slug },
    },
    orderBy: [{ featured: "desc" }, { position: "asc" }],
    take: limite,
    select: selecaoResumo,
  });
  return linhas.map(paraResumo);
}

/** Todos os slugs publicados — usado por generateStaticParams e pelo sitemap. */
export async function listarSlugsDeProduto(): Promise<string[]> {
  const linhas = await db.product.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return linhas.map((l) => l.slug);
}

/**
 * As cores que o catálogo publicado realmente oferece hoje. O hero mostra
 * essas bolinhas — e elas precisam ser as de verdade: uma amostra decorativa
 * de cores que a Raquel não tem seria uma promessa falsa logo na primeira
 * dobra do site.
 */
export async function listarCoresDisponiveis(
  limite = 8
): Promise<{ id: string; nome: string; hex: string }[]> {
  const linhas = await db.optionValue.findMany({
    where: {
      active: true,
      hex: { not: null },
      group: { slug: "cor", active: true },
      products: {
        some: { productOptionGroup: { product: { status: "PUBLISHED" } } },
      },
    },
    orderBy: { position: "asc" },
    take: limite,
    select: { id: true, name: true, hex: true },
  });
  return linhas.map((l) => ({ id: l.id, nome: l.name, hex: l.hex! }));
}
