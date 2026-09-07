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
        {/* `secao--ampla`, com DOIS traços: superfície escura comprime
            opticamente e o padding de faixa invertida sobe um degrau (§3.3 do
            sistema de espaçamento). Estava em `secao` e a faixa ficava com o
            mesmo ar de uma seção clara — ou seja, com menos ar do que parecia. */}
        <div className="container-site secao--ampla">
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

      {/* A história é uma SEÇÃO, não um rabo da faixa verde — e o que a fazia
          parecer texto vazado não era o alinhamento, era não se anunciar:
          começava em "Comecei fazendo peças" sem título, sem etiqueta, sem
          nada. Alinhei à coluna de cima primeiro, o que só trocou o problema
          por meia largura de vazio. O cabeçalho resolveu a causa.

          O que faltava depois disso era ela ser distinguível do que vem em
          seguida: cabeçalho igual, largura igual, fundo igual ao de cuidados e
          ao de perguntas — três seções seguidas lidas como uma parede só.

          Agora ela tem **superfície própria**: Cru Fundo, a terceira cor de
          papel da paleta, que sangra de borda a borda. Não é mais uma faixa
          verde (verde demais cansa e a `.trama` deixa de significar alguma
          coisa), é o mesmo papel um tom abaixo — o suficiente para o olho
          registrar "mudou de assunto" sem que a página fique listrada. É o
          mesmo recurso que a hub `/bolsas` já usa no texto longo dela.

          E a **geometria muda**: o título fica pendurado na margem esquerda,
          preso pelo `sticky` enquanto o texto corre. É uma abertura de matéria
          — que é exatamente o que este texto é.

          O título e a chamada do banco não servem aqui: são "Quem faz" e "Sou a
          Raquel…", que já estão na faixa verde logo acima. Duplicar faria a
          seção parecer um eco. */}
      {historia ? (
        <div className="bg-superficie-baixa">
          <div className="container-site secao">
            {/* A coluna de 1px no meio da grade é a régua — ela precisa de uma
                trilha própria, senão vira borda de uma das duas colunas e o
                espaço até o texto deixa de ser o mesmo dos dois lados.
                Sem `overflow` em nenhum ancestral: `clip` aqui transformaria o
                bloco no contêiner de rolagem do `sticky` e o título deixaria de
                grudar. Nada se desloca na horizontal nesta seção, então o corte
                também não é necessário. */}
            <div className="grid gap-x-coluna gap-y-bloco lg:grid-cols-[minmax(0,15rem)_1px_minmax(0,1fr)]">
              <Revelar
                entrada="ponto"
                className="lg:sticky lg:top-cabecalho-lg lg:self-start"
              >
                <Etiqueta>A história</Etiqueta>
                <h2 className="mt-2 font-display text-t2">Como começou</h2>
              </Revelar>

              {/* O fio sendo puxado enquanto ela lê. Só no desktop: no celular
                  não existe calha entre as colunas, e uma linha de 1px colada no
                  texto seria só um risco. Ver `.regua` no `globals.css`. */}
              <span className="regua hidden lg:block" aria-hidden="true" />

              {/* O corpo é leitura, não vitrine: assenta devagar e quase não se
                  desloca. Um bloco de texto que chega com energia atrapalha a
                  própria leitura. */}
              <Revelar entrada="texto" atraso={0.08} className="max-w-texto">
                <TextoLongo texto={historia.corpo} />
              </Revelar>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
