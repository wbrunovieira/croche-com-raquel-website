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
  /**
   * Folga para o envio de fotos — não é aqui que o tamanho se resolve.
   *
   * Quem reduz a foto é o navegador, antes de ela sair do celular (ver
   * `src/lib/imagem.ts`): cada uma chega ao servidor com 200 a 400 kB. Este
   * teto existe só porque a tela de criação aceita VÁRIAS fotos num envio só,
   * e dez delas passam do 1 MB que o Next aceita de fábrica.
   *
   * Subir só este número teria sido a correção preguiçosa: resolveria o 500 e
   * deixaria a Raquel esperando 6 MB subirem pelo 4G da serra, pagando armazenamento
   * caro e servindo um PNG gigante para quem só quer ver uma bolsa.
   */
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
  /**
   * **Sem `remotePatterns`, e isso é resultado de decisão e não esquecimento.**
   *
   * As fotos das peças moram no Cloudflare R2, mas quem as entrega ao navegador
   * é o próprio site, em `/fotos/<chave>` (ver `src/app/fotos/[...chave]/`).
   * Para o `next/image` elas são imagens da MESMA ORIGEM — e origem própria
   * não precisa de liberação.
   *
   * Aqui havia três domínios liberados: `*.r2.dev`, `fotos.crochecomraquel…` e
   * o Vercel Blob. Os dois primeiros nunca chegaram a ser usados (o bucket é
   * privado) e o terceiro está vazio desde a migração. Liberação de domínio é
   * superfície de confiança: manter as três seria dizer ao otimizador que pode
   * buscar e servir imagem de lugares que este site não usa mais.
   */
};

export default nextConfig;
