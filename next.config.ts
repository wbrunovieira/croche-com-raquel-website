import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
