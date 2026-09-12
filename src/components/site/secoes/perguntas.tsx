import { ChevronDown } from "lucide-react";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Revelar } from "@/components/ui/revelar";
import { IconeZap } from "@/components/ui/icone-zap";
import type { GrupoDePerguntas } from "@/lib/queries/paginas";

/**
 * Perguntas frequentes.
 *
 * Continua em `<details>`: **a resposta fica no HTML mesmo com o item
 * fechado** — que é o que o buscador precisa ler para o FAQPage — e funciona
 * sem JavaScript. O JSON-LD que descreve isto mudou de página junto, e agora
 * é emitido pela home.
 */
export function SecaoPerguntas({
  grupos,
  whatsappNumero,
}: {
  grupos: GrupoDePerguntas[];
  whatsappNumero: string;
}) {
  if (grupos.length === 0) return null;

  return (
    <section id="perguntas" className="bg-superficie-baixa scroll-mt-cabecalho-lg">
      <div className="container-site secao">
        {/* Duas colunas assimétricas: a pergunta é do lado largo, quem responde
            fica na margem. É a terceira geometria seguida e nenhuma repete a
            anterior — história pendura o título à esquerda com o texto correndo
            ao lado, cuidados centraliza e vira grade, aqui o conteúdo é uma
            coluna estreita de leitura com uma calha viva à esquerda.

            A ordem no DOM é cabeçalho → perguntas → cartão, e ela é a ordem de
            leitura certa: quem chega tem de passar pelas respostas antes de ser
            convidado a perguntar. Só a partir de `lg` o cartão sobe para a calha,
            por posicionamento de grade — no celular ele continua no fim, onde
            sempre esteve. */}
        {/* `grid-rows-[auto_1fr]` não é enfeite: sem ele o navegador reparte a
            altura da coluna de perguntas — que atravessa as duas linhas — entre as
            duas, a primeira linha estica junto e o cartão desce para o meio da
            calha, a 450px do título, parecendo perdido. Com a primeira linha
            medindo só o cabeçalho, a sobra toda cai na segunda e o cartão fica
            logo abaixo dele, que é onde ele quer estar. */}
        <div className="grid gap-x-coluna gap-y-respiro lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
          <Revelar entrada="ponto" className="lg:col-start-1 lg:row-start-1">
            <Etiqueta>Dúvidas</Etiqueta>
            <h2 className="mt-2 font-display text-t2">Perguntas frequentes</h2>
            <p className="mt-4 text-lead text-conteudo-suave">
              O que mais me perguntam no WhatsApp. Se a sua dúvida não estiver
              aqui, me chame — respondo sempre.
            </p>
          </Revelar>

          <div className="max-w-texto lg:col-start-2 lg:row-start-1 lg:row-span-2">
            {grupos.map((grupo, i) => (
              <Revelar
                key={grupo.topico}
                entrada="texto"
                atraso={0.04 * i}
                className="mt-respiro first:mt-0"
              >
                <h3 className="font-display text-t3">{grupo.topico}</h3>
                <ul className="mt-4">
                  {grupo.perguntas.map((p) => (
                    <li key={p.id} className="border-b border-borda">
                      {/* `.pergunta` liga a abertura em altura animada
                          (`::details-content`, no `globals.css`). Onde o navegador
                          não tiver a regra, abre seco — como sempre abriu. */}
                      <details className="pergunta group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-medium transition-colors marker:content-none hover:text-destaque-texto">
                          {p.pergunta}
                          <ChevronDown
                            className="size-5 shrink-0 text-conteudo-suave transition-transform duration-300 ease-fio group-open:rotate-180"
                            aria-hidden="true"
                          />
                        </summary>
                        <p className="pb-4 text-leitura text-conteudo-suave">{p.resposta}</p>
                      </details>
                    </li>
                  ))}
                </ul>
              </Revelar>
            ))}
          </div>

          <Revelar
            atraso={0.08}
            /* **O cartão vira superfície verde, e não é decoração.**

               Ele era uma caixa branca com contorno, igual a qualquer outra caixa
               branca da página — e este cartão não é "mais um conteúdo": é a
               única saída da seção, a porta para falar com ela. Numa coluna ao
               lado de dez perguntas cinzas, a caixa branca desaparecia.

               O verde é o que a marca usa nos momentos de VOZ — o hero, o quem
               faz, os cuidados, a encomenda. Aqui a Raquel está dizendo "me
               chame", então o cartão pertence àquela família, não à das
               superfícies neutras que só seguram informação.

               A `trama` vem junto porque é o que faz o verde da casa parecer
               tecido em vez de retângulo pintado — o mesmo tratamento das seções
               verdes, na escala de um cartão. */
            className="trama luz-de-janela relative overflow-hidden rounded-card bg-inv-fundo p-painel text-inv-conteudo lg:col-start-1 lg:row-start-2 lg:self-start"
          >
            <h3 className="font-display text-t3">Ficou com outra dúvida?</h3>
            <p className="mt-3 text-leitura text-inv-suave">
              Me chame no WhatsApp. Prefiro responder antes de você encomendar do
              que depois.
            </p>
            <a
              href={`https://wa.me/${whatsappNumero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="botao-claro mt-bloco inline-flex items-center gap-btn-icone rounded-fio px-btn-x py-btn-y font-medium text-verde-cristal transition-[background-color,border-color,box-shadow,transform] duration-[240ms] ease-fio active:translate-y-px"
            >
              <IconeZap className="size-5" />
              Falar com a Raquel
            </a>
            {/* A corrente fecha o pé do cartão como fecha o das seções verdes:
                o verde da casa nunca termina numa aresta lisa. */}
            <div
              className="corrente corrente--claro absolute inset-x-0 bottom-0"
              aria-hidden="true"
            />
          </Revelar>
        </div>
      </div>
    </section>
  );
}
