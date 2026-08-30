import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Etiqueta } from "@/components/ui/etiqueta";
import { TextoLongo } from "@/components/ui/texto-longo";
import { FiltroDeCor } from "@/components/catalogo/filtro-de-cor";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { buscarCategoriaPorSlug, listarCategorias } from "@/lib/queries/categorias";
import { listarCoresDisponiveis, listarProdutos } from "@/lib/queries/produtos";
import { SLUG_BOLSAS } from "@/lib/queries/tipos";

export async function generateStaticParams() {
  const categorias = await listarCategorias();
  return categorias
    .filter((c) => c.slug !== SLUG_BOLSAS)
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/categorias/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await buscarCategoriaPorSlug(slug);
  if (!categoria) return { title: "Categoria não encontrada" };
  return {
    title: `${categoria.nome} em crochê`,
    description:
      categoria.descricao ??
      `Peças de ${categoria.nome.toLowerCase()} em crochê, feitas à mão sob encomenda em Petrópolis.`,
    alternates: { canonical: `/categorias/${slug}` },
  };
}

export default async function PaginaDeCategoria({
  params,
  searchParams,
}: PageProps<"/categorias/[slug]">) {
  const [{ slug }, { cor }] = await Promise.all([params, searchParams]);
  // Bolsas têm página própria — o carro-chefe não mora no molde genérico.
  if (slug === SLUG_BOLSAS) redirect("/bolsas");

  const corAtual = typeof cor === "string" ? cor : undefined;
  const categoria = await buscarCategoriaPorSlug(slug);
  if (!categoria) notFound();

  const [produtos, cores] = await Promise.all([
    listarProdutos({ categoria: slug, cor: corAtual }),
    listarCoresDisponiveis(12, { categoria: slug }),
  ]);

  return (
    <main>
      <div className="container-site secao">
        <nav aria-label="Trilha" className="text-apoio text-conteudo-suave">
          <ol className="flex flex-wrap items-center gap-x-2">
            <li>
              <Link href="/" className="hover:text-conteudo">
                Início
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>{categoria.nome}</li>
          </ol>
        </nav>

        <div className="mt-bloco">
          <Etiqueta>Categoria</Etiqueta>
          <h1 className="mt-2 font-display text-t1">{categoria.nome}</h1>
          {categoria.descricao ? (
            <p className="mt-3 max-w-texto text-lead text-conteudo-suave">
              {categoria.descricao}
            </p>
          ) : null}
        </div>

        <div className="mt-bloco">
          <Suspense fallback={null}>
            <FiltroDeCor cores={cores} />
          </Suspense>
        </div>

        <div className="mt-bloco">
          <GradeDeProdutos
            produtos={produtos}
            vazio="Nenhuma peça nessa cor por enquanto. Tente outra, ou peça a sua sob encomenda."
          />
        </div>
      </div>

      {categoria.textoLongo ? (
        <section className="bg-superficie-baixa">
          <div className="container-site secao">
            <TextoLongo texto={categoria.textoLongo} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
