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
    <section id="perguntas" className="container-site secao scroll-mt-cabecalho-lg">
      <Revelar entrada="ponto" className="max-w-texto">
        <Etiqueta>Dúvidas</Etiqueta>
        <h2 className="mt-2 font-display text-t2">Perguntas frequentes</h2>
        <p className="mt-4 text-lead text-conteudo-suave">
          O que mais me perguntam no WhatsApp. Se a sua dúvida não estiver aqui,
          me chame — respondo sempre.
        </p>
      </Revelar>

      <div className="mt-respiro max-w-texto">
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

      <div className="mt-respiro max-w-texto rounded-card border border-borda bg-superficie p-painel">
        <h3 className="font-display text-t3">Ficou com outra dúvida?</h3>
        <p className="mt-3 text-leitura text-conteudo-suave">
          Me chame no WhatsApp. Prefiro responder antes de você encomendar do
          que depois.
        </p>
        <a
          href={`https://wa.me/${whatsappNumero}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-bloco inline-flex items-center gap-btn-icone rounded-fio bg-primaria px-btn-x py-btn-y font-medium text-sobre-primaria transition-[background-color,transform] duration-150 ease-fio active:translate-y-px hover:bg-primaria-hover"
        >
          <IconeZap className="size-5" />
          Falar com a Raquel
        </a>
      </div>
    </section>
  );
}
