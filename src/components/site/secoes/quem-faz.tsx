import Image from "next/image";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Revelar } from "@/components/ui/revelar";
import { TextoLongo } from "@/components/ui/texto-longo";
import type { ConfiguracoesDoSite } from "@/lib/queries/tipos";
import type { PaginaInstitucional } from "@/lib/queries/paginas";

/**
 * "Quem faz" — a apresentação da Raquel.
 *
 * Duas metades, e a divisão é proposital. **A faixa verde tem texto fixo, no
 * código**: ela carrega a hierarquia da seção — frase de abertura curta, em
 * display, e corpo na fonte de leitura. Como campo livre isso desandava.
 *
 * **A história, abaixo, vem do banco** e ela edita pelo painel. É o texto que
 * mudou de página em vez de sumir: era o `/sobre`, e é o conteúdo que constrói
 * confiança — como começou, por que é sob encomenda, que fio ela usa.
 */
const ABERTURA = "Sou a Raquel. Faço tudo à mão, uma peça de cada vez.";
const PARAGRAFOS = [
  "Crochê e macramê em Petrópolis, na serra do Rio. Não trabalho com estoque: você escolhe o tipo, a cor e o acabamento, e a peça só começa a ser feita depois disso. É por isso que ela sai do jeito que você quis — e é por isso que tem prazo.",
  "Se o que você tem em mente não está no site, me conte assim mesmo. Boa parte do que eu faço hoje nasceu de um pedido que ainda não existia.",
];

export function SecaoQuemFaz({
  config,
  historia,
}: {
  config: ConfiguracoesDoSite;
  historia: PaginaInstitucional | null;
}) {
  return (
    <section id="quem-faz" className="scroll-mt-cabecalho-lg">
      {/* `overflow-x-clip`: as duas metades entram deslocadas na horizontal e,
          sem o corte, os 20px de deslocamento viram rolagem lateral do corpo no
          celular. `clip` e não `hidden` — não cria contexto de rolagem. */}
      <div className="trama overflow-x-clip bg-inv-fundo text-inv-conteudo">
        <div className="container-site secao">
          <div className="grid items-center gap-x-coluna gap-y-grade-linha lg:grid-cols-[minmax(0,22rem)_1fr]">
            {/* Urdidura e trama: a foto vem de um lado, o texto do outro, e os
                dois se cruzam no meio. É o desenho que a `.trama` já faz no
                fundo desta seção, agora em movimento. */}
            {config.sobreFoto ? (
              <Revelar entrada="trama">
                <div className="relative aspect-peca w-full overflow-hidden rounded-card">
                  <Image
                    src={config.sobreFoto.url}
                    alt={config.sobreFoto.alt}
                    fill
                    sizes="(min-width: 64rem) 22rem, 100vw"
                    className="object-cover"
                  />
                </div>
              </Revelar>
            ) : null}

            <Revelar
              entrada={config.sobreFoto ? "trama-inversa" : "trama"}
              atraso={0.08}
              className={config.sobreFoto ? "" : "max-w-texto"}
            >
              <Etiqueta tom="invertido">Quem faz</Etiqueta>
              <h2 className="mt-4 max-w-[20ch] font-display text-t2">{ABERTURA}</h2>
              <div className="mt-bloco max-w-texto">
                {PARAGRAFOS.map((paragrafo, i) => (
                  <p key={i} className={`text-leitura text-inv-suave ${i > 0 ? "mt-4" : ""}`}>
                    {paragrafo}
                  </p>
                ))}
              </div>
            </Revelar>
          </div>
        </div>
      </div>

      {/* A história continua na MESMA coluna em que a fala dela parou dentro da
          faixa verde. Solta na largura do container, ela começava 400px à
          esquerda do texto de cima: a leitura saltava de lugar no meio da voz
          da Raquel. Alinhar resolveu o salto e criou o problema seguinte —
          metade da largura virava vazio à esquerda, e o bloco continuava sem
          nada que dissesse o que ele é: começava em "Comecei fazendo peças"
          do nada.

          A etiqueta na coluna vazia resolve os dois de uma vez. Ela é `sticky`
          porque o texto é longo: acompanhando a leitura, continua respondendo
          "de quem é esta voz" na altura em que a pessoa está — e a coluna deixa
          de ser ar e passa a ser margem, como numa página impressa. */}
      {historia ? (
        <div className="container-site secao">
          <div className="grid gap-x-coluna gap-y-bloco lg:grid-cols-[minmax(0,22rem)_1fr]">
            <Revelar as="div" className="lg:sticky lg:top-cabecalho-lg lg:self-start">
              <Etiqueta>A história</Etiqueta>
            </Revelar>

            {/* E é leitura, não vitrine: assenta devagar e quase não se
                desloca. Um bloco de texto que chega com energia atrapalha a
                própria leitura. */}
            <Revelar entrada="texto" className="max-w-texto">
              <TextoLongo texto={historia.corpo} />
            </Revelar>
          </div>
        </div>
      ) : null}
    </section>
  );
}
