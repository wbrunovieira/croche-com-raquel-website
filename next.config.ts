import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // As fontes das imagens de compartilhamento são lidas do disco em tempo de
  // execução. Sem declará-las aqui, elas não entram no bundle do deploy e a
  // geração da imagem quebra só em produção.
  outputFileTracingIncludes: {
    "/**": ["./src/lib/og/*.ttf"],
  },
  /**
   * As páginas institucionais viraram seção da home. Redirecionam em vez de
   * sumir: a Raquel já mandou esses endereços por WhatsApp, e link
   * compartilhado que vira 404 é confiança perdida — além de o buscador
   * demorar a soltar a URL antiga se ela só desaparecer.
   */
  async redirects() {
    const paraAncora = (de: string, ancora: string) => ({
      source: de,
      destination: `/#${ancora}`,
      permanent: true,
    });
    return [
      paraAncora("/sobre", "quem-faz"),
      paraAncora("/cuidados", "cuidados"),
      paraAncora("/perguntas-frequentes", "perguntas"),
      paraAncora("/encomendas", "encomendas"),
      paraAncora("/contato", "contato"),
      paraAncora("/catalogo", "catalogo"),
      // Categoria deixou de ser página e virou filtro do catálogo.
      {
        source: "/categorias/:slug",
        destination: "/?categoria=:slug#catalogo",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // As fotos das peças ficam no Vercel Blob. Sem liberar o domínio aqui,
        // o next/image recusa a imagem e o card fica vazio.
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
