import type { SVGProps } from "react";
import { SIMBOLO_PATH } from "./simbolo";
import { CROCHE_PATH, RAQUEL_PATH } from "./assinatura";

/**
 * O logotipo da Raquel, reproduzido.
 *
 * Ela já tinha logotipo antes do site: símbolo em cima, **"Raquel Crochê"**
 * embaixo, centrados, quase se encostando. É o que está costurado nas etiquetas
 * de couro das peças. Este componente reproduz aquela peça — não uma releitura
 * dela.
 *
 * **Tudo num `<svg>` só, de propósito.** As três partes vinham montadas com
 * flex, cada uma no seu elemento, e o resultado era símbolo e texto lado a lado
 * lendo como duas coisas separadas. Num SVG único a relação é geometria, não
 * layout: não há entrelinha, `gap` ou arredondamento de subpixel que descole o
 * desenho do nome, em nenhum tamanho.
 *
 * As proporções são medidas na arte dela, não escolhidas:
 *
 * | | |
 * |---|---|
 * | largura do símbolo | 49,8% da largura das palavras |
 * | altura do símbolo  | 181,1% da altura das palavras |
 * | vão entre os dois  | 9,1% da altura das palavras |
 * | centro do símbolo  | 2,9% da largura à direita do centro das palavras |
 *
 * O desalinhamento dos centros é dela e fica: a entrada do `R` avança muito para
 * a esquerda, e centralizar pela caixa jogaria o símbolo visualmente para fora.
 * Confirmação de que a medição está certa: a proporção do símbolo deduzida
 * dessas medidas dá 0,8855, contra 0,885 do símbolo vetorizado à parte.
 *
 * **É "Raquel Crochê", não "Crochê com Raquel".** A marca dela veio antes do
 * domínio; o nome do site continua no `aria-label`, no `<title>` e no texto.
 *
 * A cor vem de quem usa (`currentColor`): `text-primaria` na versão principal,
 * `text-inv-conteudo` sobre as seções verdes.
 */

/** Caixa do lockup inteiro. A escrita ocupa 0–100 em y; o símbolo fica acima, em y negativo. */
const LOCKUP_VIEWBOX = "0 -190.2 322.03 290.2";

/** Largura ÷ altura, para reservar espaço sem esperar o SVG carregar. */
export const LOGO_PROPORCAO = 322.03 / 290.2;

/** Leva o símbolo (`viewBox` próprio, 24 × 27,12) para o lugar e a escala dela. */
const SIMBOLO_NO_LOCKUP = "translate(90.17 -190.2) scale(6.6777)";

type Variante = "completo" | "simbolo";

export function Logo({
  variante = "completo",
  className = "",
  titulo = "Crochê com Raquel",
  ...props
}: {
  variante?: Variante;
  className?: string;
  titulo?: string;
} & Omit<SVGProps<SVGSVGElement>, "className">) {
  const so = variante === "simbolo";

  // A altura sai em `em` para quem chama continuar dimensionando com a escala
  // tipográfica (`text-t1`, `text-t3`), como era antes de o lockup virar um SVG
  // só. Na completa, 1em é a altura da escrita — o resto é o símbolo e o vão.
  const tamanho = so ? "h-[1em] w-auto" : "h-[2.902em] w-auto";

  return (
    <svg
      viewBox={so ? "0 0 24 27.12" : LOCKUP_VIEWBOX}
      className={`${tamanho} ${className}`}
      fill="currentColor"
      role="img"
      aria-label={titulo}
      {...props}
    >
      {so ? (
        <path d={SIMBOLO_PATH} fillRule="evenodd" />
      ) : (
        <>
          <g transform={SIMBOLO_NO_LOCKUP}>
            <path d={SIMBOLO_PATH} fillRule="evenodd" />
          </g>
          <path d={RAQUEL_PATH} fillRule="evenodd" />
          <path d={CROCHE_PATH} fillRule="evenodd" />
        </>
      )}
    </svg>
  );
}
