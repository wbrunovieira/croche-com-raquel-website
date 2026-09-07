import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Foto } from "@/components/ui/foto";
import { Revelar } from "@/components/ui/revelar";
import { TextoLongo } from "@/components/ui/texto-longo";
import { FiltroDeCor } from "@/components/catalogo/filtro-de-cor";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { buscarCategoriaPorSlug, listarTiposDeBolsa } from "@/lib/queries/categorias";
import { listarCoresDisponiveis, listarProdutos } from "@/lib/queries/produtos";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { IconeZap } from "@/components/ui/icone-zap";

/**
 * Hub de bolsas — a página que mira "bolsa de crochê" na busca.
 *
 * Não é um filtro do catálogo: é uma landing com conteúdo próprio e indexável,
 * porque o resto do site institucional não ranqueia sozinho para um termo de
 * intenção comercial. O texto longo vem do banco, editável no admin.
 */
export const metadata: Metadata = {
  title: "Bolsas de crochê feitas à mão",
  description:
    "Bolsas de crochê em fio de malha, feitas à mão sob encomenda em Petrópolis: transversal, tote, clutch, praia, mochila e necessaire. Você escolhe cor, tamanho e acabamento.",
  alternates: { canonical: "/bolsas" },
};

export default async function PaginaDeBolsas({
  searchParams,
}: PageProps<"/bolsas">) {
  const { cor } = await searchParams;
  const corAtual = typeof cor === "string" ? cor : undefined;

  const [categoria, tipos, produtos, cores, config] = await Promise.all([
    buscarCategoriaPorSlug("bolsas"),
    listarTiposDeBolsa(),
    listarProdutos({ categoria: "bolsas", cor: corAtual }),
    listarCoresDisponiveis(12, { categoria: "bolsas" }),
    buscarConfiguracoes(),
  ]);

  return (
    <main>
      <section className="trama bg-inv-fundo text-inv-conteudo">
        <div className="container-site secao">
          <Etiqueta tom="invertido">Carro-chefe</Etiqueta>
          <h1 className="mt-2 max-w-[16ch] font-display text-t1">
            Bolsas de crochê feitas à mão
          </h1>
          {categoria?.descricao ? (
            <p className="mt-4 max-w-texto text-leitura text-inv-suave">
              {categoria.descricao}
            </p>
          ) : null}
        </div>
      </section>

      {tipos.length > 0 ? (
        <section className="container-site secao">
          <Revelar entrada="ponto">
            <h2 className="font-display text-t2">Por tipo</h2>
          </Revelar>
          <ul className="mt-bloco grid gap-x-grade-col gap-y-grade-linha sm:grid-cols-2 lg:grid-cols-4">
            {tipos.map((t, i) => (
              <Revelar as="li" key={t.slug} atraso={0.05 * i}>
                {/* Sobe ao passar e afunda sob o dedo, como o card de peça.
                    Sem sombra: a máscara em arco é recortada, e uma sombra de
                    caixa desenharia um retângulo atrás da curva. */}
                <Link
                  href={`/bolsas/${t.slug}`}
                  className="group block transition-transform duration-200 ease-fio hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Foto imagem={null} arco />
                  <h3 className="mt-3 font-display text-t3">{t.nome}</h3>
                  <span className="mt-1 inline-flex items-center gap-2 text-apoio text-conteudo-suave">
                    {t.totalDeProdutos}{" "}
                    {t.totalDeProdutos === 1 ? "peça" : "peças"}
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

      <section className="container-site secao-densa">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-t2">Todas as bolsas</h2>
          <p className="text-apoio text-conteudo-suave">
            {produtos.length} {produtos.length === 1 ? "peça" : "peças"}
          </p>
        </div>

        <div className="mt-bloco">
          <Suspense fallback={null}>
            <FiltroDeCor cores={cores} />
          </Suspense>
        </div>

        {/* Mesma regra do catálogo da home: a grade só aparece. */}
        <Revelar entrada="grade" className="mt-bloco">
          <GradeDeProdutos
            produtos={produtos}
            vazio="Nenhuma bolsa nessa cor por enquanto. Tente outra, ou peça a sua sob encomenda."
          />
        </Revelar>
      </section>

      {categoria?.textoLongo ? (
        <section className="bg-superficie-baixa">
          <div className="container-site secao">
            <TextoLongo texto={categoria.textoLongo} />
            {/* A corrente se costura da esquerda para a direita quando chega à
                tela. É o ornamento da marca fazendo o que ele representa — um
                ponto atrás do outro — em vez de aparecer pronto. */}
            <Revelar decorativo className="corrente mt-respiro" />
            <div className="mt-bloco">
              <a
                href={`https://wa.me/${config.whatsappNumero}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-btn-icone rounded-fio bg-primaria px-btn-x py-btn-y font-medium text-sobre-primaria transition-[background-color,transform] duration-150 ease-fio active:translate-y-px hover:bg-primaria-hover"
              >
                <IconeZap className="size-5" />
                Tirar uma dúvida no WhatsApp
              </a>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
