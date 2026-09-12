import type { CSSProperties, SVGProps } from "react";
import {
  SIMBOLO_ACIMA_DA_TINTA,
  SIMBOLO_BORDA_ESQ,
  SIMBOLO_CORACOES,
  SIMBOLO_NUCLEO,
  SIMBOLO_PATH,
  SIMBOLO_PONTA_FIO,
  SIMBOLO_SEM_CORACOES,
  SIMBOLO_VIEWBOX,
} from "./simbolo";
import { CROCHE_PATH, CROCHE_VIEWBOX, RAQUEL_PATH } from "./assinatura";

/**
 * Logotipo da marca: **Raquel · símbolo · Crochê**, com a assinatura de lugar
 * embaixo.
 *
 * As peças são todas dela — o símbolo do novelo-coração e as duas palavras na
 * letra dela (ver `simbolo.tsx` e `assinatura.tsx`). O que mudou, e é o que
 * separa um logotipo de um arranjo de peças, foi a **hierarquia**.
 *
 * Antes o lockup era empilhado como na arte dela, com o símbolo a 181% da altura
 * do nome. Uma ilustração cheia de detalhe nesse tamanho não convive com um
 * script fino: ela vence, o nome vira legenda e o conjunto lê como arte de
 * feira. O Bruno apontou isso — *"ainda parece um pouco amador"* — e sugeriu o
 * caminho: o desenho no meio de "Raquel Crochê".
 *
 * Funcionou por três motivos:
 *
 * 1. **O nome passa a mandar.** O símbolo deixa de ser o dobro do nome e passa a
 *    costurar as duas palavras. É a mesma peça, com outro emprego. O peso dele
 *    também mudou: contorno forte e trama interna leve, senão nessa escala ele
 *    ou some ou vira mancha (ver `simbolo.tsx`).
 * 2. **Resolve a ligação de vez.** O desenho está *dentro* do nome, entre as
 *    duas palavras, e dois fios costuram os três — ver "Os fios", abaixo.
 * 3. **Resolve o tamanho.** Deitado, o logotipo cabe numa barra fina — a escrita
 *    dela sai a 54px no cabeçalho contra os 36px do empilhado, e o cabeçalho
 *    voltou aos 5/6,5rem de antes. A forma vertical estava custando altura de
 *    página *e* entregando um nome menor.
 *
 * ## Os fios
 *
 * O novelo dela já termina numa ponta de fio solta. Ela agora **continua até o
 * `C` de Crochê**, e um segundo fio **sai do `l` de Raquel e entra no novelo** —
 * ideia do Bruno. Lidos juntos, é um fio só: sai do fim do primeiro nome,
 * enrola no novelo e vira o começo do segundo. É o que faz as três peças serem
 * uma coisa, não três coisas alinhadas.
 *
 * As pontas não são escolhidas no olho: a saída do `l` e o extremo esquerdo do
 * `C` foram medidos na arte, e a ponta do fio solto vem da própria vetorização
 * do símbolo (`SIMBOLO_PONTA_FIO`), então acompanha se o peso dele mudar.
 *
 * **Cada fio é um movimento só.** Ver `FIO_DIREITO`.
 *
 * A assinatura em caixa alta espaçada é o que dá o tom de casa estabelecida — e
 * é verdade, não enfeite. Ela usa `textLength` com `lengthAdjust="spacing"`:
 * a entreletra é calculada para a linha medir exatamente 72% da largura do
 * logotipo, em vez de depender da métrica da fonte. Assim a justificação óptica
 * é a mesma com a Karla carregada ou na fonte de reserva.
 *
 * ## Variantes
 *
 * | | |
 * |---|---|
 * | `completo` | com a assinatura de lugar — rodapé, entrada do painel, `/estilo` |
 * | `linha`    | sem a assinatura — cabeçalho, onde ela sairia com 5px |
 * | `simbolo`  | só o novelo — favicon, e abaixo de 120px de largura |
 *
 * **Quem chama dá a altura** (`h-16`, `h-[1em]`…). O SVG traz só `w-auto`: a
 * largura vem da proporção, e as três variantes têm proporções diferentes.
 *
 * A cor vem de quem usa (`currentColor`): `text-primaria` na versão principal,
 * `text-inv-conteudo` sobre as seções verdes.
 */

/* -- Geometria, em unidades de "altura da escrita = 100" -------------------- */

const RAQUEL_LARG = 162.2;
const CROCHE_LARG = 147.47;
/** De onde o `path` do "Crochê" começa no sistema original; entra no cálculo do recuo. */
const CROCHE_X0 = Number(CROCHE_VIEWBOX.split(" ")[0]);

/**
 * Altura do símbolo e os vãos, que são **diferentes dos dois lados**. À direita
 * o `C` de Crochê abre com uma barriga larga e vazia; o mesmo vão dos dois lados
 * fazia o buraco parecer maior do lado direito. 26 à esquerda, 16 à direita.
 */
const SIMBOLO_ALT = 110;
const VAO_ESQ = 26;
const VAO_DIR = 16;
/**
 * Centro vertical do símbolo. Não é 50: a mancha da escrita dela fica entre a
 * altura-x (44) e a linha de base (64), e centrar pela caixa deixaria o símbolo
 * alto demais em relação ao que o olho lê como a linha do nome.
 */
const SIMBOLO_CY = 54;

/** Altura própria do símbolo no `viewBox` dele, para escala e proporção. */
const SIMBOLO_H = Number(SIMBOLO_VIEWBOX.split(" ")[3]);
const SIMBOLO_ESC = SIMBOLO_ALT / SIMBOLO_H;
const SIMBOLO_LARG = SIMBOLO_ALT * (24 / SIMBOLO_H);
const SIMBOLO_X = RAQUEL_LARG + VAO_ESQ;
const SIMBOLO_Y = SIMBOLO_CY - SIMBOLO_ALT / 2;
const CROCHE_X = SIMBOLO_X + SIMBOLO_LARG + VAO_DIR;
const LARGURA = CROCHE_X + CROCHE_LARG;
/**
 * Topo e base da tinta. A escrita ocupa 0–100, mas o símbolo é mais alto que
 * ela e transborda dos dois lados — sem isto o `viewBox` cortava os
 * coraçõezinhos em cima e a ponta da agulha embaixo.
 */
const TOPO = Math.min(0, SIMBOLO_Y);
const BASE_LINHA = Math.max(100, SIMBOLO_Y + SIMBOLO_ALT);

/* -- Os fios: do `l` para o novelo, e do novelo para o `C` ------------------ */

/**
 * Ponta do fio solto e borda esquerda do novelo, trazidas de `simbolo.tsx` para
 * o sistema do logotipo. Vêm da vetorização, não do olho: mudou o peso do
 * símbolo, os fios acompanham.
 */
const PONTA_X = SIMBOLO_X + SIMBOLO_PONTA_FIO.x * SIMBOLO_ESC;
const PONTA_Y = SIMBOLO_Y + SIMBOLO_PONTA_FIO.y * SIMBOLO_ESC;
const ENTRADA_X = SIMBOLO_X + SIMBOLO_BORDA_ESQ * SIMBOLO_ESC;
const ENTRADA_Y = 59;
/** Saída do `l` de Raquel e extremo esquerdo do `C` de Crochê, medidos na arte. */
const SAIDA_L = { x: 161, y: 60.5 };
const ENTRADA_C = { x: CROCHE_X + 0.94, y: 63.5 };

const n = (v: number) => v.toFixed(1);
const FIO_ESQUERDO =
  `M ${SAIDA_L.x} ${SAIDA_L.y} ` +
  `C ${SAIDA_L.x + 9} ${SAIDA_L.y + 2.4} ${SAIDA_L.x + 16} ${SAIDA_L.y + 4.4} ` +
  `${n(ENTRADA_X - 7)} ${n(ENTRADA_Y + 2.4)} ` +
  `C ${n(ENTRADA_X - 3.5)} ${n(ENTRADA_Y + 1.1)} ${n(ENTRADA_X - 1.4)} ${n(ENTRADA_Y + 0.4)} ` +
  `${n(ENTRADA_X)} ${ENTRADA_Y}`;
/**
 * **Sai do novelo e sobe para o `C` num movimento só.**
 *
 * Duas tentativas se gastaram aqui antes de o Bruno nomear a causa — *"o problema
 * era o S antes"*. O fio dela terminava numa volta sobre si mesmo: emendar depois
 * dela lia como nó, e endireitar a continuação para compensar lia como filete. A
 * volta saiu do símbolo (ver `simbolo.tsx`), e aí o trajeto certo veio sozinho:
 * o fio continua na direção em que já vinha e sobe para o `C`, uma curva só.
 */
const FIO_DIREITO =
  `M ${n(PONTA_X)} ${n(PONTA_Y)} ` +
  `C ${n(PONTA_X + 16)} ${n(PONTA_Y + 1)} ${n(ENTRADA_C.x - 16)} ${n(ENTRADA_C.y + 8)} ` +
  `${n(ENTRADA_C.x)} ${ENTRADA_C.y}`;

const FIO_ESPESSURA = 3.0;

/** Assinatura de lugar: corpo, linha de base e largura alvo (72% do logotipo). */
const ASSINATURA = "FEITO À MÃO EM PETRÓPOLIS";
const ASSINATURA_CORPO = 13;
const ASSINATURA_BASE = 128;
const ASSINATURA_LARG = LARGURA * 0.72;
const ALTURA_COM_ASSINATURA = 132 - TOPO;

export const LOGO_PROPORCAO = LARGURA / ALTURA_COM_ASSINATURA;
export const LOGO_LINHA_PROPORCAO = LARGURA / (BASE_LINHA - TOPO);

type Variante = "completo" | "linha" | "simbolo";

/**
 * Os três coraçõezinhos, soltos do novelo para poderem sumir e voltar de trás
 * dele a cada três batidas — o pedido do Bruno, e o motivo de ser a cada três e
 * não a cada uma: *"o visitante não irá fixar o logo e pode ficar cansativo e
 * disputar muito a atenção"*. O ritmo, os tempos e as trajetórias estão em
 * `globals.css`; aqui fica só o arranjo que os deixa animar.
 *
 * Três coisas desta montagem não são detalhe:
 *
 * 1. **Eles são pintados antes do resto do símbolo**, para o novelo passar por
 *    cima. Mas ordem de pintura não bastaria: o símbolo é desenho de traço, e
 *    entre as tramas se vê o fundo — um coração "atrás" apareceria pelos vãos.
 *    Daí o recorte de `SIMBOLO_ACIMA_DA_TINTA`: eles só existem acima da
 *    silhueta, e some quem entra nela.
 * 2. **O recorte fica no `g` de fora e a animação no de dentro.** O `transform`
 *    de um elemento leva junto o recorte dele; num `g` só, o recorte desceria
 *    com o coração e nunca esconderia nada.
 * 3. **Cada coração leva a própria distância até o miolo do novelo** em
 *    `--fuga-x`/`--fuga-y`, medida da vetorização (ver `simbolo.tsx`). O CSS
 *    descreve o *movimento*; a geometria continua vindo do desenho dela.
 *
 * O estado de repouso é o do logotipo parado — sem `transform` e opaco. A
 * animação parte dali e volta para lá, então nada embarca invisível no HTML do
 * servidor e quem pede menos movimento (a regra global zera a duração) vê os
 * três no lugar certo. Medido: com `prefers-reduced-motion: reduce` os três
 * ficam em x/y idênticos ao repouso, opacidade 1 e `transform: none`.
 *
 * **Duas coisas medidas que ficam como estão, e é melhor saber por quê:**
 *
 * 1. *O id do recorte é fixo.* Só o logotipo do cabeçalho bate, então há um por
 *    página — menos na `/estilo`, que mostra um segundo de propósito. Lá os
 *    dois `clipPath` nascem com o mesmo id e o navegador serve o primeiro aos
 *    dois; como a geometria é a mesma, os dois recortam igual (conferido na
 *    tela). Um id por instância exigiria `useId`, que é hook, que obrigaria o
 *    logotipo inteiro a virar componente de cliente.
 * 2. *A batida muda um triz enquanto os corações estão escondidos.* A escala da
 *    batida tem origem no centro da caixa do grupo (`transform-box: fill-box`),
 *    e essa caixa encolhe quando os corações se recolhem para dentro do novelo:
 *    o topo dela sai de y 0,01 para y 3,04. No pico da terceira batida o topo
 *    do novelo fica 0,066 unidade mais alto que no pico das outras duas — 0,17
 *    pixel na página `/estilo`, menos ainda no cabeçalho. Prender a origem em
 *    unidades do usuário custaria mais do que 0,17 pixel de erro vale.
 */
const RECORTE_ACIMA_DA_TINTA = "logo-acima-da-tinta";

function Coracoes() {
  return (
    <>
      <defs>
        <clipPath id={RECORTE_ACIMA_DA_TINTA}>
          <path d={SIMBOLO_ACIMA_DA_TINTA} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${RECORTE_ACIMA_DA_TINTA})`}>
        {SIMBOLO_CORACOES.map((coracao) => (
          <g
            key={coracao.nome}
            className={`coracao-do-logo coracao-do-logo--${coracao.nome}`}
            style={
              {
                "--fuga-x": (SIMBOLO_NUCLEO.x - coracao.cx).toFixed(2),
                "--fuga-y": (SIMBOLO_NUCLEO.y - coracao.cy).toFixed(2),
              } as CSSProperties
            }
          >
            <path d={coracao.d} />
          </g>
        ))}
      </g>
    </>
  );
}

export function Logo({
  variante = "completo",
  className = "",
  titulo = "Crochê com Raquel",
  batendo = false,
  ...props
}: {
  variante?: Variante;
  className?: string;
  titulo?: string;
  /**
   * Faz o novelo bater como um coração. **Um por página**: dois logotipos
   * batendo fora de sincronia na mesma tela viram duas coisas disputando o
   * olho. Fica no cabeçalho; rodapé e entrada do painel ficam parados.
   */
  batendo?: boolean;
} & Omit<SVGProps<SVGSVGElement>, "className">) {
  if (variante === "simbolo") {
    return (
      <svg
        viewBox={SIMBOLO_VIEWBOX}
        className={`w-auto ${className}`}
        fill="currentColor"
        role="img"
        aria-label={titulo}
        {...props}
      >
        <path d={SIMBOLO_PATH} fillRule="evenodd" />
      </svg>
    );
  }

  const comAssinatura = variante === "completo";

  return (
    <svg
      viewBox={`0 ${TOPO} ${LARGURA} ${comAssinatura ? ALTURA_COM_ASSINATURA : BASE_LINHA - TOPO}`}
      className={`w-auto ${className}`}
      fill="currentColor"
      role="img"
      aria-label={titulo}
      {...props}
    >
      <path d={RAQUEL_PATH} fillRule="evenodd" />
      {/* Dois `g` aninhados de propósito: o de fora carrega o `transform` de
          atributo que posiciona o símbolo, e o de dentro fica livre para a
          animação. Em SVG2 a propriedade CSS `transform` SUBSTITUI o atributo —
          num `g` só, a batida jogaria o novelo para o canto. */}
      <g transform={`translate(${SIMBOLO_X} ${SIMBOLO_Y}) scale(${SIMBOLO_ESC})`}>
        <g className={batendo ? "batida-do-coracao" : undefined}>
          {batendo ? <Coracoes /> : null}
          <path
            d={batendo ? SIMBOLO_SEM_CORACOES : SIMBOLO_PATH}
            fillRule="evenodd"
          />
        </g>
      </g>
      <g transform={`translate(${CROCHE_X - CROCHE_X0} 0)`}>
        <path d={CROCHE_PATH} fillRule="evenodd" />
      </g>
      <path
        d={`${FIO_ESQUERDO} ${FIO_DIREITO}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={FIO_ESPESSURA}
        strokeLinecap="round"
      />
      {comAssinatura ? (
        <text
          x={LARGURA / 2}
          y={ASSINATURA_BASE}
          textAnchor="middle"
          textLength={ASSINATURA_LARG}
          lengthAdjust="spacing"
          fontSize={ASSINATURA_CORPO}
          fontWeight={500}
          className="font-texto"
        >
          {ASSINATURA}
        </text>
      ) : null}
    </svg>
  );
}
