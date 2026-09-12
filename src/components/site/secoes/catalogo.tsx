import Link from "next/link";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Revelar } from "@/components/ui/revelar";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { listarCategorias } from "@/lib/queries/categorias";
import { listarPaginaDeProdutos } from "@/lib/queries/produtos";

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
export async function SecaoCatalogo({
  categoria,
  pagina = 1,
}: {
  categoria?: string;
  pagina?: number;
}) {
  const [categorias, folha] = await Promise.all([
    listarCategorias(),
    listarPaginaDeProdutos({ categoria, pagina }),
  ]);
  const { produtos, total, totalDePaginas } = folha;
  const paginaAtual = folha.pagina;

  // Cada combinação é uma URL, por isso o filtro de categoria é link e não botão.
  /**
   * Cada combinação é uma URL, por isso o filtro é link e não botão.
   *
   * **Trocar de categoria volta para a página 1.** Sem isso, quem está na
   * página 3 de "Todas" e clica em "Mesa" — que tem uma página só — cai numa
   * lista vazia dizendo "nenhuma peça nessa categoria", o que é mentira: há
   * três. O parâmetro de página pertence ao filtro atual, não à sessão.
   */
  const href = (cat?: string, pag = 1) => {
    const busca = new URLSearchParams();
    if (cat) busca.set("categoria", cat);
    if (pag > 1) busca.set("pagina", String(pag));
    const q = busca.toString();
    return `${q ? `/?${q}` : "/"}#catalogo`;
  };

  return (
    <section
      id="catalogo"
      className="chao-do-catalogo scroll-mt-cabecalho-lg"
    >
      <div className="container-site secao">
        {/**
         * **O cabeçalho do catálogo não repete o das outras seções.**
         *
         * Ele era igual ao da vitrine de bolsas — etiqueta, título, linha de
         * apoio, tudo à esquerda — e as duas seções ficavam com a mesma cara
         * mudando só o texto. Mas elas não fazem a mesma coisa: lá é curadoria,
         * aqui é o ÍNDICE, o único lugar da página que mostra tudo e o único que
         * filtra.
         *
         * Daí a contagem virar número grande à direita, no lugar de uma linha de
         * apoio. É a assinatura de índice — e é informação de verdade, porque
         * muda quando o filtro muda: quem clica em "Mesa" vê o 15 virar 3 e
         * entende o que aconteceu sem ler nada.
         *
         * O fio embaixo separa o que a seção É do que ela FAZ: título e
         * contagem em cima, controles embaixo. Reto e fino de propósito — a
         * `corrente` é a costura entre seções, e usá-la dentro de uma diria que
         * ali começa outra.
         */}
        <Revelar entrada="ponto">
          <Etiqueta>Todas as peças</Etiqueta>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h2 className="font-display text-t2">Catálogo</h2>
            <p className="flex items-baseline gap-2">
              <span className="tabular font-display text-t2 leading-none text-destaque-texto">
                {total}
              </span>
              <span className="text-apoio text-conteudo-suave">
                {total === 1 ? "peça" : "peças"}
                {categoria ? " com esse filtro" : ""}
              </span>
            </p>
          </div>
          <div className="mt-4 h-px w-full bg-borda" aria-hidden="true" />
        </Revelar>

        <nav aria-label="Filtrar por categoria" className="mt-respiro">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                href={href()}
                aria-current={!categoria ? "page" : undefined}
                className="chip-de-filtro inline-block rounded-fio px-btn-sm-x py-btn-sm-y text-apoio"
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
                    className="chip-de-filtro inline-flex items-center gap-2 rounded-fio px-btn-sm-x py-btn-sm-y text-apoio"
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

        {/**
         * **A paginação só existe quando há o que paginar.**
         *
         * Hoje são 15 peças, duas páginas. Mas o catálogo cresce com o cadastro,
         * e sessenta peças virariam dois mil pixels de rolagem entre quem está
         * comparando e tudo o que vem depois — quem faz, cuidados, encomenda. A
         * página inteira ficaria refém do tamanho do acervo.
         *
         * Números, e não "carregar mais": o "carregar mais" precisa de estado no
         * cliente, some ao atualizar a página e não dá endereço para mandar a
         * ninguém. Com número na URL o botão de voltar acerta e a Raquel manda o
         * link pronto.
         *
         * *Mais quieta que o filtro de propósito.* Os dois são controles da
         * mesma seção, mas o filtro é escolha — muda O QUE se vê — e a
         * paginação é só deslocamento dentro da escolha já feita. Dois controles
         * com o mesmo peso disputariam a atenção de quem só quer ver a próxima
         * fileira.
         */}
        {totalDePaginas > 1 ? (
          <nav aria-label="Páginas do catálogo" className="mt-bloco">
            <ul className="flex flex-wrap items-center justify-center gap-1">
              {Array.from({ length: totalDePaginas }, (_, i) => i + 1).map((n) => {
                const atual = n === paginaAtual;
                return (
                  <li key={n}>
                    <Link
                      href={href(categoria, n)}
                      aria-current={atual ? "page" : undefined}
                      aria-label={`Página ${n} de ${totalDePaginas}`}
                      className={`tabular grid size-11 place-items-center rounded-pilula text-apoio transition-[background-color,color,box-shadow] duration-[240ms] ease-fio ${
                        atual
                          ? "bg-primaria font-medium text-sobre-primaria"
                          : "text-conteudo-suave hover:bg-superficie-baixa hover:text-conteudo"
                      }`}
                    >
                      {n}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {/* O leitor de tela não vê o círculo verde: sem isto, ele ouve uma
                fileira de números soltos e não sabe onde está. */}
            <p className="mt-3 text-center text-legenda text-conteudo-suave">
              Página {paginaAtual} de {totalDePaginas}
            </p>
          </nav>
        ) : null}
      </div>
    </section>
  );
}
