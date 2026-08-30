import { Laco } from "./laco";

/**
 * Assinatura da marca.
 *
 * Duas linhas alinhadas à esquerda: "crochê" em Fraunces caixa baixa (os eixos
 * SOFT/WONK amolecem e desalinham a letra) e "COM RAQUEL" em Karla caixa alta,
 * espaçada, a ~38% do corpo da primeira linha. O contraste de escala e de eixo
 * já dá a hierarquia — sem ornamento, sem moldura.
 *
 * Abaixo de 120px de largura, use apenas o laço (`variante="laco"`).
 *
 * A cor vem de quem usa (`currentColor`): `text-primaria` na versão principal,
 * `text-inv-conteudo` sobre as seções verdes.
 */

type Variante = "completo" | "laco";

export function Logo({
  variante = "completo",
  className = "",
  titulo = "Crochê com Raquel",
}: {
  variante?: Variante;
  className?: string;
  titulo?: string;
}) {
  if (variante === "laco") {
    return (
      <span className={`inline-flex ${className}`} role="img" aria-label={titulo}>
        <Laco className="size-full" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-[0.5em] ${className}`}
      role="img"
      aria-label={titulo}
    >
      <Laco className="h-[1.55em] w-[1.55em] shrink-0" />
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
        <span
          className="font-texto uppercase"
          style={{
            fontSize: "0.38em",
            fontWeight: 500,
            letterSpacing: "0.16em",
            marginTop: "0.28em",
          }}
        >
          com Raquel
        </span>
      </span>
    </span>
  );
}
