import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Secao } from "@/components/admin/campos";
import { ImagensDoProduto } from "@/components/admin/imagens-do-produto";
import { FormularioDeProduto } from "@/components/admin/formulario-de-produto";
import { SLUG_BOLSAS } from "@/lib/queries/tipos";

export default async function EditarProduto({ params }: PageProps<"/admin/produtos/[id]">) {
  await exigirSessao();
  const { id } = await params;

  const [produto, categorias, subcategorias] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        category: { select: { slug: true } },
        images: { orderBy: { position: "asc" } },
      },
    }),
    db.category.findMany({ orderBy: { position: "asc" } }),
    db.subcategory.findMany({ orderBy: { position: "asc" } }),
  ]);

  if (!produto) notFound();

  return (
    <main className="container-site secao">
      <Link href="/admin/produtos" className="text-apoio text-conteudo-suave hover:text-conteudo">
        ← Peças
      </Link>

      <div className="mt-4">
        <Etiqueta>{produto.status === "PUBLISHED" ? "No ar" : "Fora do ar"}</Etiqueta>
        <h1 className="mt-2 font-display text-t1">{produto.name}</h1>
      </div>

      <div className="mt-respiro">
        <Secao
          titulo="Fotos"
          descricao="A primeira da fila é a capa. Arraste a ordem com as setas."
        >
          <ImagensDoProduto
            productId={produto.id}
            ehBolsa={produto.category.slug === SLUG_BOLSAS}
            imagens={produto.images.map((i) => ({
              id: i.id,
              url: i.url,
              alt: i.alt,
              temEscalaHumana: i.hasHumanScale,
            }))}
          />
        </Secao>

        <FormularioDeProduto
          produto={{
            id: produto.id,
            slug: produto.slug,
            nome: produto.name,
            descricao: produto.description,
            preco: produto.price === null ? "" : String(produto.price),
            categoriaId: produto.categoryId,
            subcategoriaId: produto.subcategoryId ?? "",
            status: produto.status,
            destaque: produto.featured,
          }}
          categorias={categorias.map((c) => ({ id: c.id, nome: c.name }))}
          subcategorias={subcategorias.map((s) => ({
            id: s.id,
            nome: s.name,
            categoriaId: s.categoryId,
          }))}
        />
      </div>
    </main>
  );
}
