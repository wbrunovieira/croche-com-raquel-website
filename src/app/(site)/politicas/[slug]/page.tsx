import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaDeTexto } from "@/components/site/pagina-de-texto";
import { buscarPagina, listarSlugsDePagina } from "@/lib/queries/paginas";

// Só estes slugs moram sob /politicas. As demais páginas têm rota própria, e
// uma página nova criada no admin não deve virar URL sem alguém decidir onde.
const POLITICAS = ["trocas-e-devolucoes", "privacidade"];

export async function generateStaticParams() {
  const slugs = await listarSlugsDePagina();
  return slugs.filter((s) => POLITICAS.includes(s)).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/politicas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pagina = await buscarPagina(slug);
  if (!pagina) return { title: "Página não encontrada" };
  return {
    title: pagina.titulo,
    description: pagina.descricaoSeo ?? pagina.chamada ?? undefined,
    alternates: { canonical: `/politicas/${slug}` },
  };
}

export default async function PaginaDePolitica({
  params,
}: PageProps<"/politicas/[slug]">) {
  const { slug } = await params;
  if (!POLITICAS.includes(slug)) notFound();
  const pagina = await buscarPagina(slug);
  if (!pagina) notFound();
  return <PaginaDeTexto pagina={pagina} etiqueta="Políticas" />;
}
