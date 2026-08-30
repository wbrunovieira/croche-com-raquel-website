import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, Truck } from "lucide-react";
import { Etiqueta } from "@/components/ui/etiqueta";
import { IconeInstagram } from "@/components/ui/icone-instagram";
import { IconeZap } from "@/components/ui/icone-zap";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a Raquel pelo WhatsApp ou Instagram. Atendimento em Petrópolis/RJ e envio para todo o Brasil.",
  alternates: { canonical: "/contato" },
};

export default async function PaginaDeContato() {
  const config = await buscarConfiguracoes();

  return (
    <main className="container-site secao">
      <Etiqueta>Contato</Etiqueta>
      <h1 className="mt-2 font-display text-t1">Vamos conversar</h1>
      <p className="mt-4 max-w-texto text-lead text-conteudo-suave">
        Toda peça começa numa conversa. Me diga o que você quer e a gente acerta
        cor, medida e prazo.
      </p>

      <div className="mt-respiro grid gap-x-coluna gap-y-grade-linha lg:grid-cols-2">
        <div>
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
        </div>

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
      </div>

      <p className="mt-respiro text-apoio text-conteudo-suave">
        Antes de encomendar, vale ler as{" "}
        <Link href="/perguntas-frequentes" className="text-destaque-texto underline underline-offset-4">
          perguntas frequentes
        </Link>{" "}
        e a{" "}
        <Link href="/politicas/trocas-e-devolucoes" className="text-destaque-texto underline underline-offset-4">
          política de trocas
        </Link>
        .
      </p>
    </main>
  );
}
