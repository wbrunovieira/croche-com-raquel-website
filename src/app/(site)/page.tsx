import type { Metadata } from "next";
import Link from "next/link";
import { classesDeBotao } from "@/components/ui/botao";
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
import { listarCategorias } from "@/lib/queries/categorias";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { buscarPagina, listarPerguntas, listarPerguntasPlanas } from "@/lib/queries/paginas";
import { listarDestaques } from "@/lib/queries/produtos";
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
  // Um `?cor=` antigo na URL simplesmente não é lido: o filtro por cor saiu
  // junto com os grupos de opção, e link velho da Raquel não pode quebrar.
  const { categoria } = await searchParams;
  const categoriaAtual = typeof categoria === "string" ? categoria : undefined;

  const [
    config,
    destaques,
    categorias,
    historia,
    cuidados,
    grupos,
    perguntasPlanas,
  ] = await Promise.all([
    buscarConfiguracoes(),
    listarDestaques(8),
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
  /**
   * A vitrine abaixo da dobra é **só de bolsas**. Antes mostrava `destaques`
   * cru — o que o banco marcou como destaque, misturando bolsa com sousplat —,
   * e por isso o título precisava ser genérico. As peças que saem daqui não
   * somem do site: continuam no Catálogo, logo abaixo.
   */
  const bolsasEmDestaque = destaques.filter((p) => p.ehBolsa);
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
            className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4"
          >
            {/* **Esta seção é das bolsas, e o título passou a dizer isso.**

                Era "Peças em destaque", que é genérico porque o conteúdo era
                misto — vinham as peças marcadas como destaque no banco, o que
                incluía um sousplat. Agora a seção filtra bolsas: o carro-chefe
                tem lugar próprio logo abaixo da dobra, e o título não precisa
                mais ser vago para caber em tudo.

                *Por que este título e não "Bolsas de crochê feitas à mão":*
                essa frase já é o `<title>` e o H1 da página `/bolsas`. Repetir
                faria as duas competirem pelo mesmo termo, e a home perderia
                para a página mais específica — ou pior, nenhuma das duas
                venceria. Aqui o termo vem com o diferencial que a `/bolsas`
                NÃO usa no H1 dela: sob encomenda, na cor de quem pede.

                Antes, "bolsa de crochê" não aparecia em nenhum título da home:
                nem no `<title>`, nem no H1, nem em H2 nenhum. O produto que
                mais importa não estava declarado em lugar que o buscador leia
                com peso. */}
            <div className="max-w-texto">
              {/* "O carro-chefe" saiu: era o modo como o Bruno me explicou o
                  negócio, não como a Raquel fala com quem compra. Jargão de
                  briefing não vai para a vitrine.

                  A etiqueta agora carrega o MODELO de venda e o título carrega
                  o produto — assim os dois níveis dizem coisas diferentes, em
                  vez de um repetir o outro em corpo menor. */}
              <Etiqueta>Sob encomenda</Etiqueta>
              {/* Encurtado até caber numa linha só, e essa foi a saída depois de
                  medir: "Bolsas de crochê na cor que você escolher" não tinha
                  NENHUMA largura que a quebrasse em duas linhas decentes — ou
                  sobrava "que" pendurado, ou virava três linhas. Título que
                  precisa de largura calibrada para não tropeçar é título
                  comprido demais.

                  O que saiu do título não se perdeu: "você escolhe o tom e o
                  tamanho" está na linha de apoio, que é onde cabe explicar. O
                  título diz O QUE É, o apoio diz COMO FUNCIONA. */}
              <h2 className="mt-2 font-display text-t2">Bolsas de crochê na sua cor</h2>
              {/* Sem prazo em número aqui. O FAQ diz "de 7 a 15 dias para
                  bolsas", e no FAQ isso é resposta a quem foi procurar; na
                  vitrine vira promessa, e promessa de prazo queima confiança se
                  estiver errada. Entra quando a Raquel confirmar. */}
              <p className="mt-3 text-apoio text-conteudo-suave">
                Nenhuma sai pronta da prateleira — a Raquel começa a sua depois
                que você escolhe o tom e o tamanho.
              </p>
            </div>
            {/* Era um link sublinhado onde cabia um botão: ele fica ao lado de um
                título de seção, à direita, e é a saída para o hub do carro-chefe
                — peso de botão, não de nota de rodapé. A seta desliza no hover,
                e aqui ela pode apontar: à direita dela não há nada, então o que
                ela indica é "adiante", que é para onde o link leva. */}
            {/* O `<div>` não é enfeite de layout: sem ele o botão é filho DIRETO
                do `Revelar`, que anima os filhos com `animation-fill-mode: both`
                — e animação preenchida **sobrescreve declaração de CSS**. O
                `transform` ficava cravado no valor final do keyframe, e o
                `translateY(-1px)` do hover simplesmente não valia. Medido: o
                primário do cabeçalho e o claro do hero subiam, este ficava em
                zero. Com o invólucro, quem recebe a animação é o `<div>` e o
                botão volta a mandar no próprio transform. */}
            <div className="shrink-0">
            <Link
              href="/bolsas"
              className={`${classesDeBotao("secundaria", "sm")} group`}
            >
              Ver todas as bolsas
              <ArrowRight
                className="size-4 transition-transform duration-[240ms] ease-fio group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            </div>
          </Revelar>
          {/* A vitrine só aparece — nada se desloca na frente de quem compara
              peças. Sem cascata: a grade não se monta item a item. */}
          <Revelar entrada="grade" atraso={0.08} className="mt-bloco">
            <GradeDeProdutos produtos={bolsasEmDestaque} />
          </Revelar>
        </div>
      </section>

      
      {/* Degrau de creme, não de matiz. Três seções claras vinham seguidas
          com exatamente o mesmo fundo — é disso que vem a sensação de página
          chapada, e não da falta de uma quarta cor. Meio tom abaixo basta
          para "isto é outro assunto", e não tira nada das fotos. */}
      {outrasCategorias.length > 0 ? (
        <section className="bg-superficie-baixa">
          <div className="container-site secao--densa">
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
          </div>
        </section>
      ) : null}

      <SecaoCatalogo categoria={categoriaAtual} />
      <SecaoQuemFaz config={config} historia={historia} />
      <SecaoCuidados pagina={cuidados} />
      <SecaoPerguntas grupos={grupos} whatsappNumero={config.whatsappNumero} />
      <SecaoEncomendas whatsappNumero={config.whatsappNumero} />
      <SecaoContato config={config} />
    </main>
  );
}
