import type { MetadataRoute } from "next";
import { urlDoSite } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = urlDoSite();

  // Fora de produção nada deve ser indexado: um preview no ar competindo com o
  // domínio real é um problema difícil de perceber e chato de desfazer.
  const ehProducao =
    process.env.VERCEL_ENV === "production" || !process.env.VERCEL_ENV;

  if (!ehProducao) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // O painel e o endpoint de sessão não têm nada a fazer numa busca.
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
