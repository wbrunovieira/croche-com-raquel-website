import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { Etiqueta } from "@/components/ui/etiqueta";
import { IconeZap } from "@/components/ui/icone-zap";
import { Revelar } from "@/components/ui/revelar";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { listarPerguntas, listarPerguntasPlanas } from "@/lib/queries/paginas";
import {
  DadosEstruturados,
  perguntasEstruturadas,
} from "@/components/seo/dados-estruturados";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description:
    "Prazo, envio, pagamento, cuidados e como encomendar uma peça de crochê sob medida com a Crochê com Raquel.",
  alternates: { canonical: "/perguntas-frequentes" },
};

export default async function PaginaDePerguntas() {
  const [grupos, planas, config] = await Promise.all([
    listarPerguntas(),
    listarPerguntasPlanas(),
    buscarConfiguracoes(),
  ]);

  return (
    <main className="container-site secao">
      <DadosEstruturados dados={perguntasEstruturadas(planas)} />
      <Etiqueta>Dúvidas</Etiqueta>
      <h1 className="mt-2 font-display text-t1">Perguntas frequentes</h1>
      <p className="mt-4 max-w-texto text-lead text-conteudo-suave">
        O que mais me perguntam no WhatsApp. Se a sua dúvida não estiver aqui,
        me chame — respondo sempre.
      </p>

      <div className="mt-respiro max-w-texto">
        {grupos.map((grupo, i) => (
          <Revelar key={grupo.topico} atraso={0.04 * i} className="mt-respiro first:mt-0">
            <h2 className="font-display text-t3">{grupo.topico}</h2>
            <ul className="mt-4">
              {grupo.perguntas.map((p) => (
                <li key={p.id} className="border-b border-borda">
                  {/* <details> em vez de acordeão animado: a resposta fica no
                      HTML mesmo fechada, que é o que o buscador precisa ler —
                      e funciona sem JavaScript. */}
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-medium marker:content-none">
                      {p.pergunta}
                      <ChevronDown
                        className="size-5 shrink-0 text-conteudo-suave transition-transform group-open:rotate-180"
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
        <h2 className="font-display text-t3">Ficou com outra dúvida?</h2>
        <p className="mt-3 text-leitura text-conteudo-suave">
          Me chame no WhatsApp. Prefiro responder antes de você encomendar do
          que depois.
        </p>
        <a
          href={`https://wa.me/${config.whatsappNumero}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-bloco inline-flex items-center gap-btn-icone rounded-fio bg-primaria px-btn-x py-btn-y font-medium text-sobre-primaria transition-colors hover:bg-primaria-hover"
        >
          <IconeZap className="size-5" />
          Falar com a Raquel
        </a>
      </div>
    </main>
  );
}
