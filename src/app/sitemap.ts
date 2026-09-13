import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { urlDoSite } from "@/lib/site";
import { ehDemonstracao } from "@/lib/demonstracao";

/**
 * Sitemap montado do banco: peça no ar entra, peça fora do ar não. Categoria
 * vazia também fica de fora — mandar o buscador para uma prateleira sem nada
 * gasta rastreamento e não ajuda ninguém.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = urlDoSite();

  const [produtos, paginas] = await Promise.all([
    db.product.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        // A capa decide se a peça ainda é demonstração — ver `lib/demonstracao.ts`.
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      },
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
    // Peça de demonstração não entra: ver `lib/demonstracao.ts`.
    ...produtos
      .filter((p) => !ehDemonstracao(p.images[0]?.url))
      .map((p) => ({
      url: `${base}/produtos/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
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
