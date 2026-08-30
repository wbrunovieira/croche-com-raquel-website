/**
 * Laço — o símbolo isolado da marca.
 *
 * Uma volta simples de fio que se cruza e volta: o começo de qualquer trabalho
 * de crochê. Traço de espessura constante (não é caligrafia modulada), pontas e
 * junções totalmente arredondadas, numa grade de 24×24.
 *
 * A assimetria das duas pontas é intencional. Com as pontas simétricas o desenho
 * lê como laço de fita de campanha; com uma ponta curta e a outra longa, lê como
 * fio em movimento — e ganha o defeito proposital que combina com peça feita à
 * mão. Testado a 32px e a 16px: a 32 fecha limpo, a 16 ainda se reconhece.
 */

export const LACO_PATH =
  "M8.6 19.6C10.4 17.8 13 15.6 14.8 14 16.9 12.6 17.6 11 17.6 9 17.6 5.9 15.1 3.4 12 3.4 8.9 3.4 6.4 5.9 6.4 9 6.4 11 7.1 12.6 9.2 14 11.6 15.9 15 18.6 18.6 20.8";

export function Laco({
  className,
  strokeWidth = 2.6,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
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
