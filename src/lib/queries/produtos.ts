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

/** Quantas peças cabem numa página do catálogo. Três fileiras de quatro. */
export const PECAS_POR_PAGINA = 12;

export type PaginaDeProdutos = {
  produtos: ProdutoResumo[];
  /** Total no filtro atual — o número grande do cabeçalho é este, não o da página. */
  total: number;
  pagina: number;
  totalDePaginas: number;
};

/**
 * Uma página do catálogo.
 *
 * **Por que paginar uma seção da home.** O catálogo mora dentro da página
 * única, e hoje tem 15 peças. Ele cresce com o cadastro: sessenta peças viram
 * dois mil pixels de rolagem entre quem está comparando e tudo o que vem
 * depois — a seção de quem faz, os cuidados, a encomenda. A página inteira fica
 * refém do tamanho do acervo.
 *
 * **A página vive na URL, como o filtro.** Foi a decisão da etapa 6 e ela
 * continua valendo: o botão de voltar acerta, e a Raquel pode mandar um
 * endereço pronto para a cliente. Também é o que mantém tudo no servidor — sem
 * estado de cliente, sem "carregar mais" que quebra ao atualizar.
 *
 */
export async function listarPaginaDeProdutos(
  opcoes?: FiltrosDeCatalogo & { pagina?: number }
): Promise<PaginaDeProdutos> {
  const where = condicoes(opcoes);

  /**
   * A contagem vem ANTES da busca, e isso custa um ida-e-volta.
   *
   * A primeira versão disparava as duas em paralelo e prendia ao intervalo só o
   * número DEVOLVIDO. Resultado medido: `?pagina=99` num catálogo de duas
   * páginas pulava 1.176 linhas e trazia lista vazia, enquanto o rodapé dizia
   * "página 2 de 2" — a pessoa lia "nenhuma peça" num catálogo cheio.
   *
   * Prender o `skip` exige saber o total, e saber o total exige a contagem
   * primeiro. O paralelo era mais rápido e mentia.
   */
  const total = await db.product.count({ where });
  const totalDePaginas = Math.max(1, Math.ceil(total / PECAS_POR_PAGINA));
  const pagina = Math.min(Math.max(1, opcoes?.pagina ?? 1), totalDePaginas);

  // `skip`/`take` e não `slice` de tudo: trazer sessenta linhas para mostrar
  // doze é trabalho que o banco não precisa fazer.
  const linhas = await db.product.findMany({
    where,
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: selecaoResumo,
    skip: (pagina - 1) * PECAS_POR_PAGINA,
    take: PECAS_POR_PAGINA,
  });

  return { produtos: linhas.map(paraResumo), total, pagina, totalDePaginas };
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

