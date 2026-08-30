import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Etiqueta } from "@/components/ui/etiqueta";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { buscarCategoriaPorSlug, listarCategorias } from "@/lib/queries/categorias";
import { listarProdutos } from "@/lib/queries/produtos";
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
    title: categoria.nome,
    description: categoria.descricao ?? undefined,
    alternates: { canonical: `/categorias/${slug}` },
  };
}

export default async function PaginaDeCategoria({
  params,
}: PageProps<"/categorias/[slug]">) {
  const { slug } = await params;
  // Bolsas têm página própria — o carro-chefe não mora no molde genérico.
  if (slug === SLUG_BOLSAS) redirect("/bolsas");

  const categoria = await buscarCategoriaPorSlug(slug);
  if (!categoria) notFound();

  const produtos = await listarProdutos({ categoria: slug });

  return (
    <main className="container-site secao">
      <Etiqueta>Categoria</Etiqueta>
      <h1 className="mt-2 font-display text-t1">{categoria.nome}</h1>
      {categoria.descricao ? (
        <p className="mt-3 max-w-texto text-lead text-conteudo-suave">
          {categoria.descricao}
        </p>
      ) : null}
      <div className="mt-bloco">
        <GradeDeProdutos produtos={produtos} />
      </div>
    </main>
  );
}
