import Link from "next/link";
import { Clock, MapPin, Truck } from "lucide-react";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Revelar } from "@/components/ui/revelar";
import { IconeInstagram } from "@/components/ui/icone-instagram";
import { IconeZap } from "@/components/ui/icone-zap";
import type { ConfiguracoesDoSite } from "@/lib/queries/tipos";

/**
 * Contato — o fecho da página.
 *
 * A geometria é de fechamento, e é a quarta seguida sem repetir nenhuma: o
 * convite ocupa a linha inteira, com o botão ancorado na ponta direita, e
 * embaixo os três fatos que a cliente sempre pergunta viram uma **fita de três
 * colunas** com fio no alto de cada uma. Nada mais no site é uma fita de três.
 *
 * Antes eram duas colunas — botão de um lado, lista do outro —, o mesmo desenho
 * de "quem faz" e de metade da home. Aqui a lista deixa de ser uma pilha ao
 * lado do botão e passa a ser o rodapé factual da conversa.
 */
export function SecaoContato({ config }: { config: ConfiguracoesDoSite }) {
  return (
    <section id="contato" className="container-site secao scroll-mt-cabecalho-lg">
      {/* `items-end`: o botão desce até a base do bloco de texto, em vez de
          flutuar no alto da coluna. */}
      <div className="grid items-end gap-x-coluna gap-y-bloco lg:grid-cols-[minmax(0,1fr)_auto]">
        <Revelar entrada="ponto">
          <Etiqueta>Contato</Etiqueta>
          <h2 className="mt-2 font-display text-t2">Vamos conversar</h2>
          <p className="mt-4 max-w-texto text-lead text-conteudo-suave">
            Toda peça começa numa conversa. Me diga o que você quer e a gente
            acerta cor, medida e prazo.
          </p>
        </Revelar>

        <Revelar atraso={0.08} className="lg:justify-self-end">
          <a
            href={`https://wa.me/${config.whatsappNumero}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-btn-icone rounded-fio bg-primaria px-btn-lg-x py-btn-lg-y text-leitura font-medium text-sobre-primaria transition-[background-color,transform] duration-150 ease-fio active:translate-y-px hover:bg-primaria-hover"
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
      </div>

      {/* A fita. Um observador só para as três, e a cascata é a do gesto
          `ponto`: são três itens, que é o tamanho em que cascata ainda lê como
          intenção. */}
      <Revelar
        entrada="ponto"
        as="ul"
        className="mt-respiro grid gap-x-coluna gap-y-bloco sm:grid-cols-3"
      >
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
          <li key={titulo} className="border-t border-borda pt-4">
            <Icone className="size-5 text-conteudo-suave" aria-hidden="true" />
            <p className="mt-3 font-medium">{titulo}</p>
            <p className="mt-1 text-apoio text-conteudo-suave">{texto}</p>
          </li>
        ))}
      </Revelar>

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
