import { cache } from "react";
import { db } from "@/lib/db";
import { SLUG_BOLSAS, type CategoriaResumo } from "./tipos";

/**
 * Categoria só aparece no menu se tiver produto publicado.
 *
 * Em `cache()`: o cabeçalho e o rodapé pedem esta lista na mesma renderização,
 * e `buscarCategoriaPorSlug` também se apoia nela.
 */
export const listarCategorias = cache(async function listarCategorias(): Promise<
  CategoriaResumo[]
> {
  const linhas = await db.category.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      longDescription: true,
      subcategories: {
        orderBy: { position: "asc" },
        select: { slug: true, name: true },
      },
      _count: { select: { products: { where: { status: "PUBLISHED" } } } },
      /**
       * A capa sai da primeira peça publicada — destaque primeiro, depois a
       * ordem do catálogo. Uma só: é vitrine de categoria, não galeria.
       */
      products: {
        where: { status: "PUBLISHED", images: { some: {} } },
        orderBy: [{ featured: "desc" }, { featuredPosition: "asc" }, { position: "asc" }],
        take: 1,
        select: {
          images: {
            orderBy: { position: "asc" },
            take: 1,
            select: { id: true, url: true, alt: true, hasHumanScale: true },
          },
        },
      },
    },
  });

  return linhas
    .filter((c) => c._count.products > 0)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      nome: c.name,
      descricao: c.description,
      textoLongo: c.longDescription,
      subcategorias: c.subcategories.map((s) => ({ slug: s.slug, nome: s.name })),
      totalDeProdutos: c._count.products,
      capa: (() => {
        const foto = c.products[0]?.images[0];
        return foto
          ? { id: foto.id, url: foto.url, alt: foto.alt, temEscalaHumana: foto.hasHumanScale }
          : null;
      })(),
    }));
});

export async function buscarCategoriaPorSlug(
  slug: string
): Promise<CategoriaResumo | null> {
  const categorias = await listarCategorias();
  return categorias.find((c) => c.slug === slug) ?? null;
}

/**
 * Os tipos de bolsa, para a página-hub. Só entram os que têm peça publicada —
 * um atalho para uma prateleira vazia é pior que não ter o atalho.
 */
export const listarTiposDeBolsa = cache(async function listarTiposDeBolsa(): Promise<
  { slug: string; nome: string; totalDeProdutos: number }[]
> {
  const linhas = await db.subcategory.findMany({
    where: { category: { slug: SLUG_BOLSAS } },
    orderBy: { position: "asc" },
    select: {
      slug: true,
      name: true,
      _count: { select: { products: { where: { status: "PUBLISHED" } } } },
    },
  });
  return linhas
    .filter((s) => s._count.products > 0)
    .map((s) => ({ slug: s.slug, nome: s.name, totalDeProdutos: s._count.products }));
});

export async function listarColecoesAtivas(): Promise<
  { slug: string; nome: string; descricao: string | null }[]
> {
  const linhas = await db.collection.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
    select: { slug: true, name: true, description: true },
  });
  return linhas.map((c) => ({ slug: c.slug, nome: c.name, descricao: c.description }));
}
