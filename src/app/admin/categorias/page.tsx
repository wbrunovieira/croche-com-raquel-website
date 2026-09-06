import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { CategoriasEditaveis } from "@/components/admin/categorias-editaveis";

export default async function PaginaDeCategorias() {
  await exigirSessao();
  const categorias = await db.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <main className="container-site secao">
      <Etiqueta>Catálogo</Etiqueta>
      <h1 className="mt-2 font-display text-t1">Categorias</h1>
      <p className="mt-4 max-w-texto text-leitura text-conteudo-suave">
        Arraste pela alça para mudar a ordem do menu — ou use as setas. O texto
        longo é o que faz a categoria aparecer na busca do Google.
      </p>

      <div className="mt-respiro max-w-texto">
        <CategoriasEditaveis
          categorias={categorias.map((c) => ({
            id: c.id,
            nome: c.name,
            descricao: c.description,
            textoLongo: c.longDescription,
            ativa: c.active,
            pecas: c._count.products,
          }))}
        />
      </div>
    </main>
  );
}
