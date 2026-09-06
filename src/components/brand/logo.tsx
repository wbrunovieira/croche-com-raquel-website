import { Simbolo } from "./simbolo";
import { MARCA_BASE, PalavraCroche, PalavraRaquel } from "./assinatura";

/**
 * Assinatura da marca.
 *
 * Símbolo à esquerda e, à direita, **"Crochê com Raquel" com a letra da própria
 * Raquel** nas duas palavras — vetorizadas da arte dela, a mesma escrita das
 * etiquetas de couro das peças (ver `assinatura.tsx`). Entre elas, o "com" em
 * Karla: é a única palavra que a arte dela não tem, e a escrita é ligada, então
 * não dá para recortar letras e recompor.
 *
 * A ordem é a do site, não a da arte. A etiqueta dela diz "Raquel Crochê"; aqui
 * as palavras são peças independentes, o que deixa montar o nome do site sem
 * perder a letra dela em nenhuma delas.
 *
 * O alinhamento das três não usa número mágico: as duas palavras compartilham o
 * mesmo `viewBox` vertical, então na mesma altura CSS as linhas de base já
 * coincidem. Só o "com" precisa de conta, porque é texto — a margem o desce até
 * `MARCA_BASE`, descontando a distância do topo da linha até a base da fonte
 * (≈0,75 do corpo em Karla). **A margem é dividida pelo corpo do `com`** porque
 * `em` numa margem resolve contra a `font-size` do próprio elemento, não a do
 * pai — sem isso ele sobe e vira expoente.
 *
 * Abaixo de 120px de largura, use apenas o símbolo (`variante="simbolo"`).
 *
 * A cor vem de quem usa (`currentColor`): `text-primaria` na versão principal,
 * `text-inv-conteudo` sobre as seções verdes.
 */

type Variante = "completo" | "simbolo";

/** Altura das palavras e corpo do "com", em `em` do tamanho herdado. */
const PALAVRA = 1.25;
const COM = 0.38;
const COM_MARGEM = (MARCA_BASE * PALAVRA - 0.75 * COM) / COM;

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
      className={`inline-flex items-start gap-[0.2em] ${className}`}
      role="img"
      aria-label={titulo}
    >
      {/* O símbolo é vazado — coração de novelo com agulhas e ar em volta —,
          então ele pode passar da altura das palavras sem dominar: a mancha
          continua parecida. */}
      <Simbolo className="mt-[0.06em] h-[1.45em] w-auto shrink-0" />
      <span className="flex items-start gap-[0.14em]">
        <PalavraCroche className="h-[1.25em] w-auto shrink-0" />
        <span
          className="font-texto shrink-0"
          style={{
            fontSize: `${COM}em`,
            fontWeight: 500,
            lineHeight: 1,
            marginTop: `${COM_MARGEM.toFixed(3)}em`,
          }}
        >
          com
        </span>
        <PalavraRaquel className="h-[1.25em] w-auto shrink-0" />
      </span>
    </span>
  );
}
