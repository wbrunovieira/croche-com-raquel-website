import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Etiqueta } from "@/components/ui/etiqueta";
import { FiltroDeCor } from "@/components/catalogo/filtro-de-cor";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { listarCategorias } from "@/lib/queries/categorias";
import { listarCoresDisponiveis, listarProdutos } from "@/lib/queries/produtos";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Todas as peças de crochê e macramê da Crochê com Raquel: bolsas, mesa posta, decoração, cozinha e enxoval. Feitas à mão sob encomenda em Petrópolis.",
  alternates: { canonical: "/catalogo" },
};

export default async function PaginaDeCatalogo({
  searchParams,
}: PageProps<"/catalogo">) {
  const { categoria, cor } = await searchParams;
  const categoriaAtual = typeof categoria === "string" ? categoria : undefined;
  const corAtual = typeof cor === "string" ? cor : undefined;

  const [categorias, produtos, cores] = await Promise.all([
    listarCategorias(),
    listarProdutos({ categoria: categoriaAtual, cor: corAtual }),
    listarCoresDisponiveis(12, { categoria: categoriaAtual }),
  ]);

  // O filtro de categoria é link, não botão: cada combinação vira uma URL que
  // a Raquel pode mandar pronta para a cliente.
  const href = (cat?: string) => {
    const p = new URLSearchParams();
    if (cat) p.set("categoria", cat);
    if (corAtual) p.set("cor", corAtual);
    const busca = p.toString();
    return busca ? `/catalogo?${busca}` : "/catalogo";
  };

  return (
    <main className="container-site secao">
      <Etiqueta>Todas as peças</Etiqueta>
      <h1 className="mt-2 font-display text-t1">Catálogo</h1>
      <p className="mt-3 text-apoio text-conteudo-suave">
        {produtos.length} {produtos.length === 1 ? "peça" : "peças"}
        {categoriaAtual || corAtual ? " com esse filtro" : ""}
      </p>

      <nav aria-label="Filtrar por categoria" className="mt-bloco">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href={href()}
              aria-current={!categoriaAtual ? "page" : undefined}
              className={`inline-block rounded-fio px-btn-sm-x py-btn-sm-y text-apoio transition-colors ${
                !categoriaAtual
                  ? "bg-primaria text-sobre-primaria"
                  : "border border-borda-forte hover:bg-superficie-baixa"
              }`}
            >
              Todas
            </Link>
          </li>
          {categorias.map((c) => {
            const ativa = c.slug === categoriaAtual;
            return (
              <li key={c.slug}>
                <Link
                  href={href(c.slug)}
                  aria-current={ativa ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-fio px-btn-sm-x py-btn-sm-y text-apoio transition-colors ${
                    ativa
                      ? "bg-primaria text-sobre-primaria"
                      : "border border-borda-forte hover:bg-superficie-baixa"
                  }`}
                >
                  {c.nome}
                  <span
                    className={`tabular text-legenda ${
                      ativa ? "text-sobre-primaria/70" : "text-conteudo-suave"
                    }`}
                  >
                    {c.totalDeProdutos}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-bloco">
        <Suspense fallback={null}>
          <FiltroDeCor cores={cores} />
        </Suspense>
      </div>

      <div className="mt-bloco">
        <GradeDeProdutos
          produtos={produtos}
          vazio="Nenhuma peça com esse filtro. Tente outra cor ou categoria."
        />
      </div>
    </main>
  );
}
