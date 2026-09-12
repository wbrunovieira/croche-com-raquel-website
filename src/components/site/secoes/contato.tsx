import Link from "next/link";
import { Clock, MapPin, Truck } from "lucide-react";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Revelar } from "@/components/ui/revelar";
import { IconeInstagram } from "@/components/ui/icone-instagram";
import { IconeZap } from "@/components/ui/icone-zap";
import { classesDeBotao } from "@/components/ui/botao";
import { Briefing } from "@/components/site/briefing";
import type { ConfiguracoesDoSite } from "@/lib/queries/tipos";

/**
 * Contato — o fecho da página, e agora também a encomenda sob medida.
 *
 * **As duas seções eram a mesma conversa em dois lugares.** "Sob medida" dizia
 * *"me conte o que você tem em mente"* e oferecia um campo; "Contato" dizia
 * *"toda peça começa numa conversa"* e oferecia um botão. Quem chegava ao fim
 * da página encontrava dois convites seguidos para falar com a mesma pessoa
 * pelo mesmo WhatsApp — e tinha de escolher entre duas portas sem saber a
 * diferença, que não existia.
 *
 * Unificadas, a seção passa a oferecer os DOIS jeitos de começar, lado a lado e
 * rotulados: escrever o que se quer, ou simplesmente chamar. Quem sabe o que
 * quer usa o campo; quem tem uma dúvida solta manda mensagem.
 *
 * **`#encomendas` continua existindo** como âncora-irmã, vazia e sem altura. A
 * faixa de aviso, o rodapé e o `check:seo` apontam para ela, e um endereço que
 * a Raquel já pode ter mandado para alguém não pode morrer numa reorganização
 * interna. As duas âncoras levam ao mesmo lugar, que agora é verdade.
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
      {/* A âncora antiga, viva e sem altura. Ver o comentário do módulo. */}
      <span id="encomendas" className="block scroll-mt-cabecalho-lg" aria-hidden="true" />

      <Revelar entrada="ponto" className="max-w-texto">
        <Etiqueta>Contato</Etiqueta>
        <h2 className="mt-2 font-display text-t2">Vamos conversar</h2>
        <p className="mt-4 text-lead text-conteudo-suave">
          Toda peça começa numa conversa — inclusive a que não está no catálogo.
          Tudo aqui já é feito sob encomenda, então fazer uma peça diferente é só
          uma questão de combinar.
        </p>
      </Revelar>

      {/* As duas portas, lado a lado. A da esquerda é mais larga porque escrever
          o que se quer exige espaço; a da direita é uma coluna estreita de
          atalhos. */}
      <div className="mt-respiro grid gap-x-coluna gap-y-respiro lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <Revelar entrada="ponto">
          {/* "Conte pelo site", e não "Me conte o que você tem em mente": este era
              quase o mesmo texto do rótulo do campo logo abaixo, e ler a mesma
              frase duas vezes em dois tamanhos faz a pessoa achar que perdeu
              alguma coisa. O título diz o CAMINHO, o rótulo diz o que escrever. */}
          <h3 className="font-display text-t3">Conte pelo site</h3>
          <div className="mt-bloco">
            <Briefing numeroDoWhatsapp={config.whatsappNumero} />
          </div>
        </Revelar>

        {/* A coluna da direita é um CARTÃO, e não itens soltos. Ela tem três
            linhas ao lado de um formulário alto, então sem contorno ela ficava
            boiando num vazio de meia tela — o mesmo defeito que o cartão do FAQ
            tinha. `self-start` para ela não esticar até o pé do formulário:
            cartão que estica vira coluna vazia com borda. */}
        <Revelar atraso={0.08} className="rounded-card border border-borda bg-superficie p-painel lg:self-start">
          <h3 className="font-display text-t3">Ou chame no WhatsApp</h3>
          <div className="mt-bloco">
          <a
            href={`https://wa.me/${config.whatsappNumero}`}
            target="_blank"
            rel="noopener noreferrer"
            /* Tamanho normal e `nowrap`: em `lg` dentro de um cartão de 20rem ele
               quebrava em "Falar no / WhatsApp". O botão era grande quando
               ocupava a largura da seção; agora mora numa coluna estreita, e
               tamanho de botão é do lugar, não do papel. */
            className="botao-primario inline-flex w-full items-center justify-center gap-btn-icone whitespace-nowrap rounded-fio px-btn-x py-btn-y font-medium text-sobre-primaria transition-[background-color,box-shadow,transform] duration-[240ms] ease-fio active:translate-y-px"
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

      {/**
       * **Revenda: outro público na mesma página.**
       *
       * Lojista não quer uma peça, quer um lote — e é a única pessoa que chega
       * aqui procurando preço por quantidade. Misturar essa oferta com o convite
       * para a cliente final confundiria os dois: quem quer uma bolsa leria
       * "quantidade" e acharia que precisa comprar várias.
       *
       * Por isso o bloco é separado e mais quieto que o resto da seção — uma
       * faixa contida, sem título de seção e sem botão grande. Quem é lojista
       * está varrendo a página atrás exatamente disto e acha; quem não é passa
       * por cima sem tropeçar.
       */}
      <Revelar
        entrada="ponto"
        className="mt-respiro rounded-card border border-borda bg-superficie-baixa p-painel"
      >
        <Etiqueta>Para revenda</Etiqueta>
        <p className="mt-3 max-w-texto text-leitura">
          <strong className="font-medium">Tem loja e quer revender?</strong> Faço
          preço especial para lojista. Me chame que a gente combina as peças, a
          quantidade e o prazo.
        </p>
        <p className="mt-bloco">
          <a
            href={`https://wa.me/${config.whatsappNumero}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${classesDeBotao("secundaria", "sm")} group`}
          >
            <IconeZap className="size-4" />
            Falar sobre revenda
          </a>
        </p>
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
