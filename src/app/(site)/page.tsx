import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/site/hero";
import { Revelar } from "@/components/ui/revelar";
import { Etiqueta } from "@/components/ui/etiqueta";
import { IconeZap } from "@/components/ui/icone-zap";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { listarCategorias, listarTiposDeBolsa } from "@/lib/queries/categorias";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { listarCoresDisponiveis, listarDestaques } from "@/lib/queries/produtos";
import { SLUG_BOLSAS } from "@/lib/queries/tipos";

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

  const primeiraBolsa = destaques.find((p) => p.ehBolsa) ?? destaques[0] ?? null;
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
        capa={primeiraBolsa?.capa ?? null}
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

      {config.sobreTexto ? (
        <section className="trama bg-inv-fundo text-inv-conteudo">
          <div className="container-site secao">
            <Revelar>
              <Etiqueta tom="invertido">Quem faz</Etiqueta>
              <p className="mt-4 max-w-texto font-display text-t2">{config.sobreTexto}</p>
              <div className="corrente corrente--claro mt-respiro" aria-hidden="true" />
            </Revelar>
          </div>
        </section>
      ) : null}

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
