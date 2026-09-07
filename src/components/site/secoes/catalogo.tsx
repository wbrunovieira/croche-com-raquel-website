import Link from "next/link";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Revelar } from "@/components/ui/revelar";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { listarCategorias } from "@/lib/queries/categorias";
import { listarProdutos } from "@/lib/queries/produtos";

/**
 * O catálogo inteiro, filtrável por categoria, como seção da home.
 *
 * **O filtro continua morando na URL** — agora como parâmetro da home, e não de
 * `/catalogo`. Era a decisão da etapa 6 e ela sobrevive à página única: o
 * endereço volta certo no botão de voltar e a Raquel consegue mandar para a
 * cliente um link já filtrado ("olha as bolsas").
 *
 * O preço disso é que a home deixa de ser estática — ler `searchParams` torna a
 * rota dinâmica. Vale a troca: link filtrado é recurso de venda, e a home
 * continua sendo uma consulta ao banco, num site pequeno.
 */
export async function SecaoCatalogo({ categoria }: { categoria?: string }) {
  const [categorias, produtos] = await Promise.all([
    listarCategorias(),
    listarProdutos({ categoria }),
  ]);

  // Cada combinação é uma URL, por isso o filtro de categoria é link e não botão.
  const href = (cat?: string) => {
    const busca = cat ? `categoria=${encodeURIComponent(cat)}` : "";
    return `${busca ? `/?${busca}` : "/"}#catalogo`;
  };

  return (
    <section id="catalogo" className="container-site secao scroll-mt-cabecalho-lg">
      {/* Etiqueta, título e contagem chegam em cascata curta — três itens, que
          é o limite em que cascata ainda lê como intenção. */}
      <Revelar entrada="ponto">
        <Etiqueta>Todas as peças</Etiqueta>
        <h2 className="mt-2 font-display text-t2">Catálogo</h2>
        <p className="mt-3 text-apoio text-conteudo-suave">
          {produtos.length} {produtos.length === 1 ? "peça" : "peças"}
          {categoria ? " com esse filtro" : ""}
        </p>
      </Revelar>

      <nav aria-label="Filtrar por categoria" className="mt-bloco">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href={href()}
              aria-current={!categoria ? "page" : undefined}
              className={`inline-block rounded-fio px-btn-sm-x py-btn-sm-y text-apoio transition-colors ${
                !categoria
                  ? "bg-primaria text-sobre-primaria"
                  : "border border-borda-forte hover:bg-superficie-baixa"
              }`}
            >
              Todas
            </Link>
          </li>
          {categorias.map((c) => {
            const ativa = c.slug === categoria;
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

      {/* A grade do catálogo só aparece. Quem chega aqui está comparando peças,
          e uma grade que se monta na frente da pessoa atrasa a tarefa real —
          por isso `grade` mexe só em opacidade e não tem cascata nenhuma. */}
      <Revelar entrada="grade" className="mt-bloco">
        <GradeDeProdutos
          produtos={produtos}
          vazio="Nenhuma peça nessa categoria. Tente outra."
        />
      </Revelar>
    </section>
  );
}
