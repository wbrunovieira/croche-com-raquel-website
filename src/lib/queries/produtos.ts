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
 * Uma regra vale em todas elas: só produto `PUBLISHED` chega ao site; `DRAFT`
 * — "fora do ar" no painel — fica só para a Raquel.
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

export type FiltrosDeCatalogo = {
  categoria?: string;
  subcategoria?: string;
  colecao?: string;
};

function condicoes(f: FiltrosDeCatalogo = {}) {
  return {
    status: "PUBLISHED" as const,
    ...(f.categoria ? { category: { slug: f.categoria } } : {}),
    ...(f.subcategoria ? { subcategory: { slug: f.subcategoria } } : {}),
    ...(f.colecao ? { collections: { some: { slug: f.colecao, active: true } } } : {}),
  };
}

export async function listarProdutos(
  opcoes?: FiltrosDeCatalogo
): Promise<ProdutoResumo[]> {
  const linhas = await db.product.findMany({
    where: condicoes(opcoes),
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

