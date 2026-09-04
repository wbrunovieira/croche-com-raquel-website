import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { urlDoSite } from "@/lib/site";

/**
 * Sitemap montado do banco: peça publicada entra, rascunho não. Categoria
 * vazia também fica de fora — mandar o buscador para uma prateleira sem nada
 * gasta rastreamento e não ajuda ninguém.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = urlDoSite();

  const [produtos, subcategorias, paginas] = await Promise.all([
    db.product.findMany({
      where: { status: "PUBLISHED" },
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

  // Só as políticas seguem com URL própria: precisam ser linkáveis de fora,
  // de e-mail e de recibo. As demais viraram seção da home.
  const POLITICAS = ["trocas-e-devolucoes", "privacidade"];

  const fixas: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/bolsas`, changeFrequency: "weekly", priority: 0.9 },
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
    ...paginas
      .filter((p) => POLITICAS.includes(p.slug))
      .map((p) => ({
      url: `${base}/politicas/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
