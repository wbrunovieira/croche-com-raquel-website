import type { Metadata } from "next";
import Link from "next/link";
import { Etiqueta } from "@/components/ui/etiqueta";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { buscarCategoriaPorSlug, listarTiposDeBolsa } from "@/lib/queries/categorias";
import { listarProdutos } from "@/lib/queries/produtos";

// Versão mínima, para a navegação funcionar. A página-hub de verdade — com
// conteúdo indexável, filtro por tipo e texto sobre fio e personalização —
// é a etapa 6.

export const metadata: Metadata = {
  title: "Bolsas de crochê feitas à mão",
  description:
    "Bolsas de crochê em fio de malha, feitas à mão sob encomenda em Petrópolis: transversal, tote, clutch, praia e necessaire.",
  alternates: { canonical: "/bolsas" },
};

export default async function PaginaDeBolsas() {
  const [categoria, tipos, produtos] = await Promise.all([
    buscarCategoriaPorSlug("bolsas"),
    listarTiposDeBolsa(),
    listarProdutos({ categoria: "bolsas" }),
  ]);

  return (
    <main className="container-site secao">
      <Etiqueta>Carro-chefe</Etiqueta>
      <h1 className="mt-2 font-display text-t1">Bolsas</h1>
      {categoria?.descricao ? (
        <p className="mt-3 max-w-texto text-lead text-conteudo-suave">
          {categoria.descricao}
        </p>
      ) : null}

      {tipos.length > 0 ? (
        <nav aria-label="Tipos de bolsa" className="mt-bloco">
          <ul className="flex flex-wrap gap-2">
            {tipos.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/bolsas/${t.slug}`}
                  className="inline-block rounded-fio border border-borda-forte px-btn-sm-x py-btn-sm-y text-apoio transition-colors hover:bg-superficie-baixa"
                >
                  {t.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="mt-bloco">
        <GradeDeProdutos produtos={produtos} />
      </div>
    </main>
  );
}
