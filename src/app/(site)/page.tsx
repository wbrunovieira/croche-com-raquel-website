import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/site/hero";
import { Revelar } from "@/components/ui/revelar";
import { Etiqueta } from "@/components/ui/etiqueta";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { Simbolo } from "@/components/brand/simbolo";
import { SecaoCatalogo } from "@/components/site/secoes/catalogo";
import { SecaoQuemFaz } from "@/components/site/secoes/quem-faz";
import { SecaoCuidados } from "@/components/site/secoes/cuidados";
import { SecaoPerguntas } from "@/components/site/secoes/perguntas";
import { SecaoEncomendas } from "@/components/site/secoes/encomendas";
import { SecaoContato } from "@/components/site/secoes/contato";
import {
  DadosEstruturados,
  perguntasEstruturadas,
} from "@/components/seo/dados-estruturados";
import { listarCategorias, listarTiposDeBolsa } from "@/lib/queries/categorias";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { buscarPagina, listarPerguntas, listarPerguntasPlanas } from "@/lib/queries/paginas";
import { listarCoresDisponiveis, listarDestaques } from "@/lib/queries/produtos";
import { SLUG_BOLSAS, type ImagemDeProduto } from "@/lib/queries/tipos";

/**
 * A home é o site.
 *
 * O projeto é de uma página só, com duas exceções: `/produtos/[slug]`, que são
 * os links que a Raquel manda no WhatsApp, e `/bolsas`, o hub do carro-chefe —
 * a única página com texto longo escrito para ranquear.
 *
 * Tudo o mais virou seção com âncora: catálogo, quem faz, cuidados, perguntas,
 * encomenda sob medida e contato. As rotas antigas redirecionam para cá, em
 * `next.config.ts`, porque a Raquel já pode ter compartilhado alguma delas.
 */
export const metadata: Metadata = {
  description:
    "Bolsas, mesa posta e decoração em crochê e macramê, feitas à mão sob encomenda em Petrópolis/RJ. Veja o catálogo, os cuidados com a peça e encomende pelo WhatsApp.",
  alternates: { canonical: "/" },
};

export default async function Home({ searchParams }: PageProps<"/">) {
  const { categoria, cor } = await searchParams;
  const categoriaAtual = typeof categoria === "string" ? categoria : undefined;
  const corAtual = typeof cor === "string" ? cor : undefined;

  const [
    config,
    destaques,
    cores,
    tiposDeBolsa,
    categorias,
    historia,
    cuidados,
    grupos,
    perguntasPlanas,
  ] = await Promise.all([
    buscarConfiguracoes(),
    listarDestaques(8),
    listarCoresDisponiveis(),
    listarTiposDeBolsa(),
    listarCategorias(),
    buscarPagina("sobre"),
    buscarPagina("cuidados"),
    listarPerguntas(),
    listarPerguntasPlanas(),
  ]);

  // O arco é exclusivo de bolsa, então só bolsa entra no rodízio do hero. A
  // ordem é a curadoria dela. Sem bolsa com foto, cai em qualquer peça que
  // tenha uma; sem nenhuma, o Hero mostra o placeholder.
  const comFoto = (p: { capa: ImagemDeProduto | null }) => p.capa !== null;
  const capasDeBolsa = destaques.filter((p) => p.ehBolsa).filter(comFoto);
  const capasDoHero = (capasDeBolsa.length > 0 ? capasDeBolsa : destaques.filter(comFoto))
    .slice(0, 5)
    .map((p) => p.capa)
    .filter((c) => c !== null);
  const outrasCategorias = categorias.filter((c) => c.slug !== SLUG_BOLSAS);

  return (
    // `scroll-mt`: a âncora fica no topo do `main`, que começa abaixo do
    // cabeçalho e da faixa de aviso. Sem a margem, "Início" parava 128px
    // abaixo do topo real e a faixa sumia.
    <main id="topo" className="scroll-mt-cabecalho-lg">
      {/* O FAQPage mudou de página junto com as perguntas. */}
      <DadosEstruturados dados={perguntasEstruturadas(perguntasPlanas)} />

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
          curadoria da Raquel, não cálculo.

          A marca entra aqui como marca-d'água, e só aqui: esta é a seção creme
          com espaço aberto de sobra. Grande e quase apagada — marca-d'água
          pequena lê como erro, enorme lê como intenção. Não vai nas seções
          verdes porque a `trama` já faz textura de superfície lá. */}
      <section className="relative overflow-hidden">
        <Simbolo className="pointer-events-none absolute right-[4%] top-1/2 h-[62%] -translate-y-1/2 text-primaria opacity-[0.05]" />
        <div className="container-site secao relative">
          {/* O cabeçalho entra em `ponto`: o título e o link para as bolsas
              chegam em cascata curta, um ponto depois do outro. */}
          <Revelar
            entrada="ponto"
            className="flex flex-wrap items-end justify-between gap-4"
          >
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
          </Revelar>
          {/* A vitrine só aparece — nada se desloca na frente de quem compara
              peças. Sem cascata: a grade não se monta item a item. */}
          <Revelar entrada="grade" atraso={0.08} className="mt-bloco">
            <GradeDeProdutos produtos={destaques} />
          </Revelar>
        </div>
      </section>

      {tiposDeBolsa.length > 0 ? (
        <section className="container-site secao-densa">
          <Revelar entrada="ponto">
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
        <section className="container-site secao-densa">
          <Revelar entrada="ponto">
            <Etiqueta>Para a casa</Etiqueta>
            <h2 className="mt-2 font-display text-t2">Além das bolsas</h2>
          </Revelar>
          <ul className="mt-bloco grid gap-x-grade-col gap-y-grade-linha sm:grid-cols-2 lg:grid-cols-3">
            {outrasCategorias.map((c, i) => (
              <Revelar as="li" key={c.slug} atraso={0.06 * i}>
                {/* Categoria virou filtro do catálogo, não página. */}
                <Link
                  href={`/?categoria=${c.slug}#catalogo`}
                  className="card-peca group flex h-full flex-col rounded-card border border-borda bg-superficie p-painel"
                >
                  <h3 className="font-display text-t3">{c.nome}</h3>
                  {c.descricao ? (
                    <p className="mt-3 flex-1 text-apoio text-conteudo-suave">{c.descricao}</p>
                  ) : null}
                  <span className="mt-6 inline-flex items-center gap-2 text-apoio text-destaque-texto">
                    Ver {c.totalDeProdutos} {c.totalDeProdutos === 1 ? "peça" : "peças"}
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

      <SecaoCatalogo categoria={categoriaAtual} cor={corAtual} />
      <SecaoQuemFaz config={config} historia={historia} />
      <SecaoCuidados pagina={cuidados} />
      <SecaoPerguntas grupos={grupos} whatsappNumero={config.whatsappNumero} />
      <SecaoEncomendas whatsappNumero={config.whatsappNumero} />
      <SecaoContato config={config} />
    </main>
  );
}
