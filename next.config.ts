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
      // Os tipos de bolsa deixaram de ter página própria: o "Tipo" saiu do
      // cadastro, e lista que ninguém alimenta vira mentira aos poucos —
      // bolsa nova nunca apareceria em /bolsas/transversal. Quem tem o link
      // antigo cai no hub, que tem todas.
      { source: "/bolsas/:tipo", destination: "/bolsas", permanent: true },
      // Categoria deixou de ser página e virou filtro do catálogo.
      {
        source: "/categorias/:slug",
        destination: "/?categoria=:slug#catalogo",
        permanent: true,
      },
    ];
  },
  /**
   * Folga para o envio de fotos — não é aqui que o tamanho se resolve.
   *
   * Quem reduz a foto é o navegador, antes de ela sair do celular (ver
   * `src/lib/imagem.ts`): cada uma chega ao servidor com 200 a 400 kB. Este
   * teto existe só porque a tela de criação aceita VÁRIAS fotos num envio só,
   * e dez delas passam do 1 MB que o Next aceita de fábrica.
   *
   * Subir só este número teria sido a correção preguiçosa: resolveria o 500 e
   * deixaria a Raquel esperando 6 MB subirem pelo 4G da serra, pagando Blob
   * caro e servindo um PNG gigante para quem só quer ver uma bolsa.
   */
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
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
