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
            className="rounded-card border border-borda bg-superficie p-painel lg:col-start-1 lg:row-start-2 lg:self-start"
          >
            <h3 className="font-display text-t3">Ficou com outra dúvida?</h3>
            <p className="mt-3 text-leitura text-conteudo-suave">
              Me chame no WhatsApp. Prefiro responder antes de você encomendar do
              que depois.
            </p>
            <a
              href={`https://wa.me/${whatsappNumero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="botao-primario mt-bloco inline-flex items-center gap-btn-icone rounded-fio px-btn-x py-btn-y font-medium text-sobre-primaria transition-[background-color,box-shadow,transform] duration-[240ms] ease-fio active:translate-y-px"
            >
              <IconeZap className="size-5" />
              Falar com a Raquel
            </a>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
