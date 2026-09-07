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
  const nome = encontrado.nome.toLowerCase();
  return {
    title: `Bolsa ${nome} de crochê`,
    description: `Bolsas ${nome} de crochê feitas à mão sob encomenda em Petrópolis. Cor, tamanho e acabamento combinados no atendimento.`,
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
      <nav aria-label="Trilha" className="text-apoio text-conteudo-suave">
        <ol className="flex flex-wrap items-center gap-x-2">
          <li>
            <Link href="/" className="hover:text-conteudo">
              Início
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/bolsas" className="hover:text-conteudo">
              Bolsas
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{encontrado.nome}</li>
        </ol>
      </nav>

      <div className="mt-bloco">
        <Etiqueta>Bolsas</Etiqueta>
        <h1 className="mt-2 font-display text-t1">{encontrado.nome}</h1>
        <p className="mt-3 text-apoio text-conteudo-suave">
          {produtos.length} {produtos.length === 1 ? "peça" : "peças"}
        </p>
      </div>

      <div className="mt-bloco">
        <GradeDeProdutos
          produtos={produtos}
          vazio="Nenhuma peça desse tipo por enquanto. Peça a sua sob encomenda."
        />
      </div>
    </main>
  );
}
