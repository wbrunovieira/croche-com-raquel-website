import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { FormularioDeCategoria } from "@/components/admin/formulario-de-categoria";
import { ApagarCategoria } from "@/components/admin/apagar-categoria";

export default async function EditarCategoria({ params }: PageProps<"/admin/categorias/[id]">) {
  await exigirSessao();
  const { id } = await params;

  const categoria = await db.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      longDescription: true,
      position: true,
      active: true,
      capaProdutoId: true,
      _count: { select: { products: true, subcategories: true } },
      products: {
        orderBy: [{ featured: "desc" }, { position: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          status: true,
          images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } },
        },
      },
    },
  });
  if (!categoria) notFound();

  return (
    <>
      <Link
        href="/admin/categorias"
        className="inline-flex items-center gap-2 text-apoio text-conteudo-suave transition-colors duration-[240ms] ease-fio hover:text-conteudo"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Categorias
      </Link>

      <div className="mt-4">
        <Etiqueta>Catálogo</Etiqueta>
        <h1 className="mt-2 font-display text-t2">{categoria.name}</h1>
        <p className="mt-2 text-apoio text-conteudo-suave">
          {categoria._count.products}{" "}
          {categoria._count.products === 1 ? "peça" : "peças"} nesta categoria.
        </p>
      </div>

      <div className="mt-bloco max-w-texto">
        <FormularioDeCategoria
          categoria={{
            id: categoria.id,
            nome: categoria.name,
            descricao: categoria.description,
            textoLongo: categoria.longDescription,
            posicao: categoria.position,
            ativa: categoria.active,
            capaProdutoId: categoria.capaProdutoId,
          }}
          pecas={categoria.products.map((p) => ({
            id: p.id,
            nome: p.name,
            publicada: p.status === "PUBLISHED",
            foto: p.images[0] ?? null,
          }))}
        />

        {/* Apagar fica longe do formulário e depois dele: é a única ação
            irreversível da tela, e ação irreversível não divide espaço com
            "Salvar". */}
        <div className="mt-respiro border-t border-borda pt-bloco">
          <ApagarCategoria
            id={categoria.id}
            nome={categoria.name}
            totalDePecas={categoria._count.products}
          />
        </div>
      </div>
    </>
  );
}
