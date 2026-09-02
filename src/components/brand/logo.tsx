import { Simbolo } from "./simbolo";

/**
 * Assinatura da marca.
 *
 * Duas linhas alinhadas à esquerda: "crochê" em Fraunces caixa baixa (os eixos
 * SOFT/WONK amolecem e desalinham a letra) e "COM RAQUEL" em Karla caixa alta,
 * espaçada, a ~38% do corpo da primeira linha. O contraste de escala e de eixo
 * já dá a hierarquia — sem ornamento, sem moldura.
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
      className={`inline-flex items-start gap-[0.30em] ${className}`}
      role="img"
      aria-label={titulo}
    >
      {/* A tinta das duas linhas ocupa 1,30em de altura. O laço era igualado a
          isso, mas o novelo é 43% mais largo na mesma altura (0,885:1 contra
          0,62:1) e a essa escala dominava a assinatura. Recuado para 1,15em, a
          mancha do símbolo volta a pesar como a do texto. */}
      <Simbolo className="mt-[0.06em] h-[1.75em] w-auto shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className="font-display lowercase"
          style={{
            fontSize: "1em",
            fontWeight: 500,
            fontVariationSettings: '"opsz" 144, "SOFT" 60, "WONK" 1',
            letterSpacing: "-0.005em",
          }}
        >
          crochê
        </span>
        {/* Justificada oticamente à largura de "crochê": a 0,38em ela media 146,9px
            contra 137,1px da palavra. A margem negativa mata o espaço que o
            tracking deixa depois da última letra — sem ela a linha parece
            deslocada para a direita mesmo com a largura certa. */}
        <span
          className="font-texto uppercase"
          style={{
            fontSize: "0.345em",
            fontWeight: 500,
            letterSpacing: "0.16em",
            marginRight: "-0.16em",
            marginTop: "0.26em",
          }}
        >
          com Raquel
        </span>
      </span>
    </span>
  );
}
