import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { AvisoDeArmazenamento } from "@/components/admin/aviso-de-armazenamento";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Secao } from "@/components/admin/campos";
import { ImagensDoProduto } from "@/components/admin/imagens-do-produto";
import { FormularioDeProduto } from "@/components/admin/formulario-de-produto";

export default async function EditarProduto({ params }: PageProps<"/admin/produtos/[id]">) {
  await exigirSessao();
  const { id } = await params;

  const [produto, categorias] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        category: { select: { slug: true } },
        images: { orderBy: { position: "asc" } },
      },
    }),
    db.category.findMany({
      // Só o que o `<select>` usa. Sem `select`, isto puxava `longDescription`
      // — texto longo — de cada categoria só para montar uma lista de nomes.
      select: { id: true, name: true },
      orderBy: { position: "asc" },
    }),
  ]);

  if (!produto) notFound();

  return (
    <main className="container-site secao">
      <Link href="/admin/produtos" className="text-apoio text-conteudo-suave hover:text-conteudo">
        ← Peças
      </Link>

      <div className="mt-4">
        <Etiqueta>{produto.status === "PUBLISHED" ? "Ativa" : "Desativada"}</Etiqueta>
        <h1 className="mt-2 font-display text-t1">{produto.name}</h1>
      </div>

      {/* O aviso vem antes da seção de fotos: é ali que ela vai tentar anexar. */}
      <AvisoDeArmazenamento />

      <div className="mt-respiro">
        <Secao
          titulo="Fotos"
          descricao="A primeira da fila é a capa. Arraste a ordem com as setas."
        >
          <ImagensDoProduto
            productId={produto.id}
            imagens={produto.images.map((i) => ({
              id: i.id,
              url: i.url,
              alt: i.alt,
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
            status: produto.status,
            destaque: produto.featured,
          }}
          categorias={categorias.map((c) => ({ id: c.id, nome: c.name }))}
        />
      </div>
    </main>
  );
}
