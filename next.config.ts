import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // As fontes das imagens de compartilhamento são lidas do disco em tempo de
  // execução. Sem declará-las aqui, elas não entram no bundle do deploy e a
  // geração da imagem quebra só em produção.
  outputFileTracingIncludes: {
    "/**": ["./src/lib/og/*.ttf"],
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
