/**
 * Tokens de movimento — o mesmo vocabulário para o CSS e para o JavaScript.
 *
 * A curva estava copiada literal em oito lugares (`[0.22, 1, 0.36, 1]`) e o
 * `--ease-fio` do `globals.css`, que é exatamente a mesma curva, não era usado
 * por nenhum JS. Duas fontes da verdade para uma decisão só: bastava alguém
 * ajustar a curva de um lado para o site passar a ter dois movimentos.
 *
 * As durações têm nome de intenção, não de número, porque é assim que a
 * decisão se toma: "isto é uma resposta ao toque" (toque) ou "isto é uma peça
 * entrando em cena" (entrada). Trocar 0,2 por 0,22 num lugar só é o tipo de
 * deriva que faz um site parecer montado por várias mãos.
 */

/** A curva da marca. Espelha `--ease-fio` no `globals.css`. */
export const FIO = [0.22, 1, 0.36, 1] as const;

export const DURACAO = {
  /** Resposta imediata a um toque ou hover — 180ms é o que a identidade pede. */
  toque: 0.18,
  /** Abrir/fechar um menu, girar um chevron. */
  curta: 0.2,
  /** Cabeçalho encolhendo, gaveta, indicador do menu. */
  media: 0.3,
  /** Troca de foto: precisa durar o bastante para não piscar. */
  troca: 0.35,
  /** Entrada de conteúdo em cena. */
  entrada: 0.6,
} as const;

/**
 * Transição pronta para o `motion`, já respeitando quem pediu menos movimento.
 *
 * Em JS o `prefers-reduced-motion` não chega sozinho: o bloco global do CSS
 * zera `animation-duration`, mas o `motion` anima por `requestAnimationFrame` e
 * passa por fora dele. Por isso todo componente animado lê `useReducedMotion()`
 * numa variável `semMovimento` e a entrega aqui.
 */
export function transicao(duracao: number, semMovimento?: boolean | null) {
  return { duration: semMovimento ? 0 : duracao, ease: FIO };
}
