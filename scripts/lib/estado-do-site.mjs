/**
 * Esta página é a de obra, ou o site de verdade?
 *
 * **Havia três respostas diferentes para a mesma pergunta.** Duas verificações e
 * o aquecedor procuravam `— em breve`; uma terceira procurava `O site está sendo
 * feito`. Uma revisão de copy silenciaria umas e não outras — e verificação
 * silenciosa é indistinguível de verificação que passa.
 *
 * O sinal primário é a `<meta name="estado-do-site" content="obra">`, posta em
 * `src/app/em-construcao/page.tsx`: ela existe para máquina, então não muda
 * quando a frase da tela muda. Os textos ficam como reserva porque um deploy
 * anterior à meta ainda pode estar no ar — e o dia de rodar isto contra um
 * deploy antigo é justamente um dia de investigação.
 */
const TEXTOS_HISTORICOS = [/—\s*em breve/, /O site está sendo feito/];

export function ehObra(html) {
  if (/name="estado-do-site"\s+content="obra"/.test(html)) return true;
  if (/content="obra"\s+name="estado-do-site"/.test(html)) return true;
  return TEXTOS_HISTORICOS.some((t) => t.test(html));
}
