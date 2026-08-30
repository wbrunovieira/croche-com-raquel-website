"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Foto } from "@/components/ui/foto";
import type { ImagemDeProduto } from "@/lib/queries/tipos";

/**
 * Galeria da página de produto.
 *
 * Crochê vende pela textura, então a foto grande precisa poder ser ampliada.
 * Clicar abre a imagem em tela cheia; Esc e clique fora fecham.
 *
 * Sem acervo cadastrado ainda, cai no placeholder — e a galeria não quebra.
 */
export function Galeria({
  imagens,
  arco,
  nomeDoProduto,
}: {
  imagens: ImagemDeProduto[];
  arco: boolean;
  nomeDoProduto: string;
}) {
  const [atual, setAtual] = useState(0);
  const [ampliada, setAmpliada] = useState(false);

  useEffect(() => {
    if (!ampliada) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAmpliada(false);
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [ampliada]);

  const imagem = imagens[atual] ?? null;

  return (
    <div>
      {imagem ? (
        <button
          type="button"
          onClick={() => setAmpliada(true)}
          className="block w-full cursor-zoom-in"
          aria-label={`Ampliar foto de ${nomeDoProduto}`}
        >
          <Foto imagem={imagem} arco={arco} prioridade />
        </button>
      ) : (
        <Foto imagem={null} arco={arco} prioridade />
      )}

      {imagens.length > 1 ? (
        <ul className="mt-4 flex flex-wrap gap-3">
          {imagens.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setAtual(i)}
                aria-label={`Ver foto ${i + 1} de ${imagens.length}`}
                aria-current={i === atual}
                className={`relative block size-20 overflow-hidden rounded-fio border transition-colors ${
                  i === atual ? "border-conteudo" : "border-borda hover:border-borda-forte"
                }`}
              >
                <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {ampliada && imagem ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ampliada de ${nomeDoProduto}`}
          onClick={() => setAmpliada(false)}
          className="fixed inset-0 z-50 grid cursor-zoom-out place-items-center bg-verde-musgo/95 p-borda-pagina"
        >
          <div className="relative max-h-full w-full max-w-produto">
            <Image
              src={imagem.url}
              alt={imagem.alt}
              width={1600}
              height={2000}
              className="mx-auto h-auto max-h-[85vh] w-auto rounded-card object-contain"
            />
          </div>
          <button
            type="button"
            onClick={() => setAmpliada(false)}
            className="absolute top-borda-pagina right-borda-pagina rounded-fio bg-cru px-btn-x py-btn-y text-apoio font-medium text-verde-cristal"
          >
            Fechar
          </button>
        </div>
      ) : null}
    </div>
  );
}
