import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { urlDoSite } from "@/lib/site";
import { SLUG_BOLSAS } from "@/lib/queries/tipos";

/**
 * Sitemap montado do banco: peça publicada entra, rascunho não. Categoria
 * vazia também fica de fora — mandar o buscador para uma prateleira sem nada
 * gasta rastreamento e não ajuda ninguém.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = urlDoSite();

  const [produtos, categorias, subcategorias, paginas] = await Promise.all([
    db.product.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({
      where: { products: { some: { status: "PUBLISHED" } } },
      select: { slug: true, updatedAt: true },
    }),
    db.subcategory.findMany({
      where: { products: { some: { status: "PUBLISHED" } } },
      select: { slug: true, updatedAt: true },
    }),
    db.page.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const POLITICAS = ["trocas-e-devolucoes", "privacidade"];
  const caminhoDaPagina = (slug: string) =>
    POLITICAS.includes(slug) ? `/politicas/${slug}` : `/${slug}`;

  const fixas: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/bolsas`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/catalogo`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/encomendas`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/perguntas-frequentes`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contato`, changeFrequency: "yearly", priority: 0.5 },
  ];

  return [
    ...fixas,
    ...produtos.map((p) => ({
      url: `${base}/produtos/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...subcategorias.map((s) => ({
      url: `${base}/bolsas/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...categorias
      .filter((c) => c.slug !== SLUG_BOLSAS)
      .map((c) => ({
        url: `${base}/categorias/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...paginas.map((p) => ({
      url: `${base}${caminhoDaPagina(p.slug)}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
