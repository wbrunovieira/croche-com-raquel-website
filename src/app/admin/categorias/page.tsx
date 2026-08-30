import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { AreaDeTexto, Campo, Secao } from "@/components/admin/campos";
import { FormularioSimples } from "@/components/admin/formulario-simples";
import { salvarCategoria } from "../acoes-de-conteudo";

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
        O texto longo é o que faz a página da categoria aparecer na busca do
        Google. Use <code>## </code> no começo da linha para virar subtítulo e{" "}
        <code>**palavra**</code> para negrito.
      </p>

      <div className="mt-respiro max-w-texto space-y-respiro">
        {categorias.map((c) => (
          <Secao key={c.id} titulo={c.name} descricao={`${c._count.products} peças`}>
            <FormularioSimples acao={salvarCategoria}>
              <input type="hidden" name="id" value={c.id} />
              <Campo id={`name-${c.id}`} rotulo="Nome" name="name" defaultValue={c.name} required />
              <AreaDeTexto
                id={`description-${c.id}`}
                name="description"
                rotulo="Uma linha"
                dica="Aparece abaixo do título e no card da home."
                rows={2}
                defaultValue={c.description ?? ""}
              />
              <AreaDeTexto
                id={`longDescription-${c.id}`}
                name="longDescription"
                rotulo="Texto longo da página"
                dica="Opcional. É o conteúdo que o Google lê."
                rows={10}
                defaultValue={c.longDescription ?? ""}
              />
              <Campo
                id={`position-${c.id}`}
                name="position"
                rotulo="Ordem no menu"
                type="number"
                min={0}
                defaultValue={c.position}
              />
            </FormularioSimples>
          </Secao>
        ))}
      </div>
    </main>
  );
}
