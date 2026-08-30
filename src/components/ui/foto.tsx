import Image from "next/image";
import type { ImagemDeProduto } from "@/lib/queries/tipos";

/**
 * Foto de produto.
 *
 * Duas regras da identidade moram aqui:
 *  - bolsa usa a máscara em **arco**; as demais categorias, card reto. A forma
 *    codifica o carro-chefe em vez de decorar;
 *  - dentro de um card o raio interno é zero (raio externo 6 − padding 12).
 *
 * Sem imagem cadastrada, entra o placeholder — o acervo real da Raquel só
 * chega na etapa 13, e um card quebrado é pior que um placeholder honesto.
 * Em seção verde ele precisa de `sobreEscuro`: o placeholder padrão é verde
 * profundo e desaparece por completo sobre o próprio fundo verde.
 */
export function Foto({
  imagem,
  arco = false,
  dentroDeCard = false,
  prioridade = false,
  sobreEscuro = false,
  className = "",
}: {
  imagem: ImagemDeProduto | null;
  arco?: boolean;
  dentroDeCard?: boolean;
  prioridade?: boolean;
  /** Marque quando a foto estiver sobre uma seção verde. */
  sobreEscuro?: boolean;
  className?: string;
}) {
  const forma = arco ? "arco" : dentroDeCard ? "rounded-none" : "rounded-card";
  const base = `relative aspect-peca w-full overflow-hidden ${forma} ${className}`;

  if (!imagem) {
    const fundo = sobreEscuro
      ? "bg-cru/10 border border-inv-borda"
      : "trama bg-verde-fundo";
    return (
      <div className={`${base} ${fundo} grid place-items-center`}>
        <span className="text-legenda uppercase tracking-[0.12em] text-inv-suave">
          foto {arco ? "de bolsa" : "do produto"}
        </span>
      </div>
    );
  }

  return (
    <div className={base}>
      <Image
        src={imagem.url}
        alt={imagem.alt}
        fill
        priority={prioridade}
        sizes="(min-width: 64rem) 25vw, (min-width: 48rem) 33vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
