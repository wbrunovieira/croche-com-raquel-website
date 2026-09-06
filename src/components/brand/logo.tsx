import { Simbolo } from "./simbolo";
import { Assinatura } from "./assinatura";

/**
 * Assinatura da marca.
 *
 * Símbolo à esquerda; à direita, duas linhas: "CROCHÊ COM" em Karla caixa alta
 * espaçada, pequena, e embaixo **"Raquel" com a letra da própria Raquel** —
 * vetorizada da arte dela, a mesma escrita das etiquetas de couro das peças
 * (ver `assinatura.tsx`).
 *
 * A hierarquia inverteu de propósito. Antes "crochê" vinha grande em Fraunces e
 * "COM RAQUEL" era a linha de apoio; o nome dela era a menor coisa da marca. Nas
 * etiquetas é o contrário: quem assina a peça é a Raquel, e o nome ocupa a peça
 * inteira. Com a letra dela no site, mantê-la como legenda de 0,345em deixaria a
 * assinatura ilegível no cabeçalho — testado — além de contar a história errada.
 *
 * A sobrancelha é justificada oticamente à largura da assinatura: a 0,30em com
 * 0,21em de entreletra ela mede 248,2px contra 249,2px do "Raquel" (corpo de
 * 100px). A margem negativa mata o espaço que a entreletra deixa depois da
 * última letra — sem ela a linha parece deslocada para a direita.
 *
 * Abaixo de 120px de largura, use apenas o símbolo (`variante="simbolo"`).
 *
 * A cor vem de quem usa (`currentColor`): `text-primaria` na versão principal,
 * `text-inv-conteudo` sobre as seções verdes.
 */

type Variante = "completo" | "simbolo";

export function Logo({
  variante = "completo",
  className = "",
  titulo = "Crochê com Raquel",
}: {
  variante?: Variante;
  className?: string;
  titulo?: string;
}) {
  if (variante === "simbolo") {
    return (
      <span className={`inline-flex ${className}`} role="img" aria-label={titulo}>
        <Simbolo className="h-full w-auto" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-start gap-[0.32em] ${className}`}
      role="img"
      aria-label={titulo}
    >
      {/* O símbolo é vazado — coração de novelo com agulhas e ar em volta —,
          então ele pode passar da altura do bloco de texto (1,76em de tinta)
          sem dominar: a mancha continua parecida. */}
      <Simbolo className="mt-[0.02em] h-[2.15em] w-auto shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className="font-texto uppercase"
          style={{
            fontSize: "0.30em",
            fontWeight: 500,
            letterSpacing: "0.21em",
            marginRight: "-0.21em",
            marginBottom: "0.14em",
            whiteSpace: "nowrap",
          }}
        >
          crochê com
        </span>
        <Assinatura className="h-[1.4em] w-auto" />
      </span>
    </span>
  );
}
