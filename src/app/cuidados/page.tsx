import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaDeTexto } from "@/components/site/pagina-de-texto";
import { buscarPagina } from "@/lib/queries/paginas";

const SLUG = "cuidados";

export async function generateMetadata(): Promise<Metadata> {
  const pagina = await buscarPagina(SLUG);
  if (!pagina) return { title: "Página não encontrada" };
  return {
    title: pagina.titulo,
    description: pagina.descricaoSeo ?? pagina.chamada ?? undefined,
    alternates: { canonical: `/${SLUG}` },
  };
}

export default async function Pagina() {
  const pagina = await buscarPagina(SLUG);
  if (!pagina) notFound();
  return <PaginaDeTexto pagina={pagina} etiqueta="Cuidados" />;
}
