import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { urlDoSite } from "@/lib/site";
import { ehDominioDeProducao, mostraSiteCompleto } from "@/lib/hospedagem";

const BLOQUEIA_TUDO: MetadataRoute.Robots = {
  rules: [{ userAgent: "*", disallow: "/" }],
};

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = urlDoSite();
  const host = (await headers()).get("host") ?? "";

  // Em desenvolvimento vale a regra do site no ar, e não a do host: é assim que
  // `pnpm check:seo` consegue exercitar as regras de verdade contra o localhost.
  const local = !process.env.VERCEL_ENV;

  if (!local) {
    // Preview, URL de deploy, qualquer host que não seja o domínio: fora do
    // buscador. Um segundo endereço servindo o mesmo site compete com o
    // primeiro, e é um problema difícil de perceber e chato de desfazer.
    if (!ehDominioDeProducao(host)) return BLOQUEIA_TUDO;

    // O domínio ainda mostra a página de obra: só ela existe. Apontar o
    // sitemap aqui mandaria o buscador a dezenas de URLs que hoje respondem
    // todas com a mesma página de obra — conteúdo duplicado antes da estreia.
    if (!mostraSiteCompleto(host)) {
      return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/api/"] }], host: base };
    }
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
