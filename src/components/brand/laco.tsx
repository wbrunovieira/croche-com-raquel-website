/**
 * Laço — o símbolo isolado da marca.
 *
 * Uma volta simples de fio que se cruza e volta: o começo de qualquer trabalho
 * de crochê. Traço de espessura constante (não é caligrafia modulada), pontas e
 * junções totalmente arredondadas, numa grade de 24×24.
 *
 * O viewBox é apertado ao traçado (`5.9 2 12.2 19.7`, medido com getBBox mais meia
 * espessura de traço), não a uma grade quadrada de 24×24. A grade quadrada deixava
 * 30% de vazio de cada lado dentro da caixa, e esse vazio somava com o gap do
 * lockup: o espaço escrito era 0,42em e o espaço visto era quase o dobro. Com a
 * caixa apertada, o gap escrito é o gap visto.
 *
 * A proporção fica 0,62:1 (largura:altura) — o componente não é quadrado. Dimensione
 * pela ALTURA (`h-*`) e deixe a largura seguir.
 *
 * Duas decisões de desenho, ambas testadas renderizando o traçado:
 *
 * 1. O cruzamento fica colado na base do laço. Com as pontas longas o desenho lê
 *    como balão preso a um barbante; encurtando as pontas até o cruzamento
 *    encostar no laço, passa a ler como nó de fio.
 * 2. As pontas são levemente assimétricas. Perfeitamente simétricas, o desenho
 *    lê como laço de fita de campanha.
 *
 * Descartados no caminho: o elo do ponto corrente (lê como alfinete de mapa) e a
 * roseta de três elos (lê como trevo). Validado a 240px, 66px e 32px.
 */

/** Caixa apertada ao traçado: sem vazio, o gap escrito é o gap visto. */
export const LACO_VIEWBOX = "5.9 2 12.2 19.7";

/** Proporção largura:altura do traçado. Dimensione pela altura. */
export const LACO_PROPORCAO = 12.2 / 19.7;

export const LACO_PATH =
  "M9.6 20C10.7 18.7 11.9 17.4 13.1 16 15.4 13.4 16.8 11.3 16.8 9 16.8 5.9 14.6 3.3 12 3.3 9.4 3.3 7.2 5.9 7.2 9 7.2 11.3 8.6 13.4 10.9 16 12.2 17.5 13.6 19 14.9 20.4";

export function Laco({
  className,
  strokeWidth = 2.6,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox={LACO_VIEWBOX}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d={LACO_PATH}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
