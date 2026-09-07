import type { Metadata } from "next";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Revelar } from "@/components/ui/revelar";
import { TextoLongo } from "@/components/ui/texto-longo";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { buscarCategoriaPorSlug } from "@/lib/queries/categorias";
import { listarProdutos } from "@/lib/queries/produtos";
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

export default async function PaginaDeBolsas() {
  const [categoria, produtos, config] = await Promise.all([
    buscarCategoriaPorSlug("bolsas"),
    listarProdutos({ categoria: "bolsas" }),
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


      <section className="container-site secao--densa">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-t2">Todas as bolsas</h2>
          <p className="text-apoio text-conteudo-suave">
            {produtos.length} {produtos.length === 1 ? "peça" : "peças"}
          </p>
        </div>

        {/* Mesma regra do catálogo da home: a grade só aparece. */}
        <Revelar entrada="grade" className="mt-bloco">
          <GradeDeProdutos
            produtos={produtos}
            vazio="Nenhuma bolsa no ar por enquanto. Peça a sua sob encomenda."
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
