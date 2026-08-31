import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/site/hero";
import { Revelar } from "@/components/ui/revelar";
import { Etiqueta } from "@/components/ui/etiqueta";
import { IconeZap } from "@/components/ui/icone-zap";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { listarCategorias, listarTiposDeBolsa } from "@/lib/queries/categorias";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { listarCoresDisponiveis, listarDestaques } from "@/lib/queries/produtos";
import {
  SLUG_BOLSAS,
  type ConfiguracoesDoSite,
  type ImagemDeProduto,
} from "@/lib/queries/tipos";

// A home herda título e descrição do layout raiz; só a canônica precisa ser
// declarada aqui, senão "/" fica sem ela.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [config, destaques, cores, tiposDeBolsa, categorias] = await Promise.all([
    buscarConfiguracoes(),
    listarDestaques(8),
    listarCoresDisponiveis(),
    listarTiposDeBolsa(),
    listarCategorias(),
  ]);

  // O arco é exclusivo de bolsa, então só bolsa pode entrar no rodízio do hero.
  // A ordem é a curadoria dela: quem está em destaque, na posição que ela deu.
  // Sem bolsa com foto, cai numa peça qualquer — e, sem nenhuma, no placeholder.
  const comFoto = (p: { capa: ImagemDeProduto | null }) => p.capa !== null;
  const capasDeBolsa = destaques.filter((p) => p.ehBolsa).filter(comFoto);
  // Sem bolsa com foto, o rodízio cai em qualquer peça que tenha uma; sem
  // nenhuma, o Hero mostra o placeholder.
  const capasDoHero = (capasDeBolsa.length > 0 ? capasDeBolsa : destaques.filter(comFoto))
    .slice(0, 5)
    .map((p) => p.capa)
    .filter((c) => c !== null);
  const outrasCategorias = categorias.filter((c) => c.slug !== SLUG_BOLSAS);

  return (
    <main>
      <Hero
        titulo={config.heroTitulo ?? "Bolsas que você carrega por anos"}
        subtitulo={
          config.heroSubtitulo ??
          "Peças de crochê feitas à mão, sob encomenda, na cor e no tamanho que você escolher."
        }
        cores={cores}
        capas={capasDoHero}
        whatsappNumero={config.whatsappNumero}
        cidade={config.cidade}
      />

      {/* Destaques logo abaixo da dobra: bolsa é o carro-chefe e a vitrine é
          curadoria da Raquel, não cálculo. */}
      <section className="container-site secao">
        <Revelar>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Etiqueta>Escolhidas por ela</Etiqueta>
              <h2 className="mt-2 font-display text-t2">Peças em destaque</h2>
            </div>
            <Link
              href="/bolsas"
              className="inline-flex items-center gap-2 py-2 -my-2 text-apoio text-destaque-texto underline underline-offset-4 hover:no-underline"
            >
              Ver todas as bolsas
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Revelar>
        <Revelar atraso={0.08} className="mt-bloco">
          <GradeDeProdutos produtos={destaques} />
        </Revelar>
      </section>

      {tiposDeBolsa.length > 0 ? (
        <section className="container-site secao-densa">
          <Revelar>
            <Etiqueta>Navegar por tipo</Etiqueta>
            <h2 className="mt-2 font-display text-t2">Que bolsa você procura?</h2>
          </Revelar>
          <Revelar atraso={0.08} className="mt-bloco">
            <ul className="flex flex-wrap gap-3">
              {tiposDeBolsa.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/bolsas/${t.slug}`}
                    className="group inline-flex items-center gap-3 rounded-fio border border-borda-forte px-btn-x py-btn-y transition-colors hover:bg-primaria hover:text-sobre-primaria"
                  >
                    {t.nome}
                    <span className="tabular text-legenda text-conteudo-suave transition-colors group-hover:text-sobre-primaria/70">
                      {t.totalDeProdutos}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Revelar>
        </section>
      ) : null}

      {outrasCategorias.length > 0 ? (
        <section className="container-site secao">
          <Revelar>
            <Etiqueta>Para a casa</Etiqueta>
            <h2 className="mt-2 font-display text-t2">Além das bolsas</h2>
          </Revelar>
          <ul className="mt-bloco grid gap-x-grade-col gap-y-grade-linha sm:grid-cols-2 lg:grid-cols-3">
            {outrasCategorias.map((c, i) => (
              <Revelar as="li" key={c.slug} atraso={0.06 * i}>
                <Link
                  href={`/categorias/${c.slug}`}
                  className="group flex h-full flex-col rounded-card border border-borda bg-superficie p-painel transition-shadow hover:shadow-peca"
                >
                  <h3 className="font-display text-t3">{c.nome}</h3>
                  {c.descricao ? (
                    <p className="mt-3 flex-1 text-apoio text-conteudo-suave">
                      {c.descricao}
                    </p>
                  ) : null}
                  <span className="mt-6 inline-flex items-center gap-2 text-apoio text-destaque-texto">
                    Ver {c.totalDeProdutos}{" "}
                    {c.totalDeProdutos === 1 ? "peça" : "peças"}
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </Revelar>
            ))}
          </ul>
        </section>
      ) : null}

      {config.sobreTexto ? <QuemFaz config={config} /> : null}

      <section className="container-site secao">
        <Revelar className="mx-auto max-w-texto text-center">
          <h2 className="font-display text-t2">Não achou o que queria?</h2>
          <p className="mt-3 text-leitura text-conteudo-suave">
            Toda peça é feita sob encomenda. Me conte o que você tem em mente —
            medida, cor, ocasião — e a gente resolve pelo WhatsApp.
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
        </Revelar>
      </section>
    </main>
  );
}

/**
 * A faixa do "quem faz".
 *
 * Quem compra feito à mão quer ver quem fez — por isso a foto vem antes do
 * texto na leitura, e não como enfeite ao lado dele. Sem foto cadastrada a
 * seção continua de pé, só com o texto, ocupando a largura de leitura.
 *
 * O texto se distribui sozinho: o primeiro parágrafo é o título da seção, em
 * display; os seguintes são corpo. Assim a Raquel controla a hierarquia
 * escrevendo, sem precisar de campo separado para título e para corpo.
 */
function QuemFaz({ config }: { config: ConfiguracoesDoSite }) {
  const [abertura, ...resto] = (config.sobreTexto ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="trama bg-inv-fundo text-inv-conteudo">
      <div className="container-site secao">
        <div className="grid items-center gap-x-coluna gap-y-grade-linha lg:grid-cols-[minmax(0,20rem)_1fr]">
          {config.sobreFoto ? (
            <Revelar>
              <div className="relative aspect-peca w-full overflow-hidden rounded-card">
                <Image
                  src={config.sobreFoto.url}
                  alt={config.sobreFoto.alt}
                  fill
                  sizes="(min-width: 64rem) 20rem, 100vw"
                  className="object-cover"
                />
              </div>
            </Revelar>
          ) : null}

          <Revelar atraso={0.08} className={config.sobreFoto ? "" : "max-w-texto"}>
            <Etiqueta tom="invertido">Quem faz</Etiqueta>
            <h2 className="mt-4 max-w-texto font-display text-t2">{abertura}</h2>
            {resto.map((paragrafo, i) => (
              <p key={i} className="mt-4 max-w-texto text-leitura text-inv-suave">
                {paragrafo}
              </p>
            ))}
            <Link
              href="/sobre"
              className="mt-bloco inline-flex items-center gap-btn-icone text-leitura underline underline-offset-4 hover:no-underline"
            >
              Conheça o ateliê
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Revelar>
        </div>

        <div className="corrente corrente--claro mt-respiro" aria-hidden="true" />
      </div>
    </section>
  );
}
