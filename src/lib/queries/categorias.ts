import { db } from "@/lib/db";
import { SLUG_BOLSAS, type CategoriaResumo } from "./tipos";

/** Categoria só aparece no menu se tiver produto publicado. */
export async function listarCategorias(): Promise<CategoriaResumo[]> {
  const linhas = await db.category.findMany({
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
    }));
}

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
export async function listarTiposDeBolsa(): Promise<
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
}

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
