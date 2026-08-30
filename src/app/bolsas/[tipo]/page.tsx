import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Etiqueta } from "@/components/ui/etiqueta";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { listarTiposDeBolsa } from "@/lib/queries/categorias";
import { listarProdutos } from "@/lib/queries/produtos";

export async function generateStaticParams() {
  const tipos = await listarTiposDeBolsa();
  return tipos.map((t) => ({ tipo: t.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/bolsas/[tipo]">): Promise<Metadata> {
  const { tipo } = await params;
  const encontrado = (await listarTiposDeBolsa()).find((t) => t.slug === tipo);
  if (!encontrado) return { title: "Tipo não encontrado" };
  return {
    title: `Bolsa ${encontrado.nome.toLowerCase()} de crochê`,
    alternates: { canonical: `/bolsas/${tipo}` },
  };
}

export default async function PaginaDeTipoDeBolsa({
  params,
}: PageProps<"/bolsas/[tipo]">) {
  const { tipo } = await params;
  const encontrado = (await listarTiposDeBolsa()).find((t) => t.slug === tipo);
  if (!encontrado) notFound();

  const produtos = await listarProdutos({ categoria: "bolsas", subcategoria: tipo });

  return (
    <main className="container-site secao">
      <Link href="/bolsas" className="text-apoio text-conteudo-suave hover:text-conteudo">
        ← Todas as bolsas
      </Link>
      <div className="mt-4">
        <Etiqueta>Bolsas</Etiqueta>
        <h1 className="mt-2 font-display text-t1">{encontrado.nome}</h1>
      </div>
      <div className="mt-bloco">
        <GradeDeProdutos produtos={produtos} />
      </div>
    </main>
  );
}
