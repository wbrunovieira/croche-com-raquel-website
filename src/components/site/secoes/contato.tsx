import Link from "next/link";
import { Clock, MapPin, Truck } from "lucide-react";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Revelar } from "@/components/ui/revelar";
import { IconeInstagram } from "@/components/ui/icone-instagram";
import { IconeZap } from "@/components/ui/icone-zap";
import type { ConfiguracoesDoSite } from "@/lib/queries/tipos";

export function SecaoContato({ config }: { config: ConfiguracoesDoSite }) {
  return (
    <section id="contato" className="container-site secao scroll-mt-cabecalho-lg">
      <Revelar>
        <Etiqueta>Contato</Etiqueta>
        <h2 className="mt-2 font-display text-t2">Vamos conversar</h2>
        <p className="mt-4 max-w-texto text-lead text-conteudo-suave">
          Toda peça começa numa conversa. Me diga o que você quer e a gente
          acerta cor, medida e prazo.
        </p>
      </Revelar>

      <div className="mt-respiro grid gap-x-coluna gap-y-grade-linha lg:grid-cols-2">
        <Revelar>
          <a
            href={`https://wa.me/${config.whatsappNumero}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-btn-icone rounded-fio bg-primaria px-btn-lg-x py-btn-lg-y text-leitura font-medium text-sobre-primaria transition-colors hover:bg-primaria-hover"
          >
            <IconeZap className="size-5" />
            Falar no WhatsApp
          </a>

          {config.instagramUrl ? (
            <p className="mt-bloco">
              <a
                href={config.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-base text-destaque-texto underline underline-offset-4 hover:no-underline"
              >
                <IconeInstagram className="size-5" />
                @croche.comraquel
              </a>
            </p>
          ) : null}

          {config.email ? (
            <p className="mt-4 text-base">
              <a
                href={`mailto:${config.email}`}
                className="text-destaque-texto underline underline-offset-4 hover:no-underline"
              >
                {config.email}
              </a>
            </p>
          ) : null}
        </Revelar>

        <Revelar atraso={0.08}>
          <ul className="space-y-6">
            {[
              {
                Icone: MapPin,
                titulo: config.cidade,
                texto: "Entrega combinada pessoalmente aqui na cidade, sem frete.",
              },
              {
                Icone: Truck,
                titulo: "Envio para todo o Brasil",
                texto: "Pelos Correios. O frete é calculado pelo seu CEP na hora da encomenda.",
              },
              {
                Icone: Clock,
                titulo: "Tudo sob encomenda",
                texto: "Não há estoque: a peça começa a ser feita depois que você escolhe.",
              },
            ].map(({ Icone, titulo, texto }) => (
              <li key={titulo} className="flex gap-4">
                <Icone className="mt-1 size-5 shrink-0 text-conteudo-suave" aria-hidden="true" />
                <div>
                  <p className="font-medium">{titulo}</p>
                  <p className="mt-1 text-apoio text-conteudo-suave">{texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </Revelar>
      </div>

      <p className="mt-respiro text-apoio text-conteudo-suave">
        Antes de encomendar, vale ler as{" "}
        <Link href="/#perguntas" className="text-destaque-texto underline underline-offset-4">
          perguntas frequentes
        </Link>{" "}
        e a{" "}
        <Link
          href="/politicas/trocas-e-devolucoes"
          className="text-destaque-texto underline underline-offset-4"
        >
          política de trocas
        </Link>
        .
      </p>
    </section>
  );
}
