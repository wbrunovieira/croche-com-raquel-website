import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { EditorDeOpcoes, type GrupoDoAdmin } from "@/components/admin/editor-de-opcoes";

export default async function PaginaDeOpcoes() {
  await exigirSessao();

  const grupos = await db.optionGroup.findMany({
    orderBy: { position: "asc" },
    include: {
      values: {
        orderBy: { position: "asc" },
        include: { _count: { select: { products: true } } },
      },
    },
  });

  const dados: GrupoDoAdmin[] = grupos.map((g) => ({
    id: g.id,
    nome: g.name,
    slug: g.slug,
    tipo: g.type,
    ativo: g.active,
    valores: g.values.map((v) => ({
      id: v.id,
      nome: v.name,
      hex: v.hex,
      linhaDoFio: v.yarnLine,
      codigoDaCor: v.yarnColorCode,
      ativo: v.active,
      emUso: v._count.products,
    })),
  }));

  return (
    <main className="container-site secao">
      <Etiqueta>Catálogo</Etiqueta>
      <h1 className="mt-2 font-display text-t1">Cores e opções</h1>
      <p className="mt-4 max-w-texto text-leitura text-conteudo-suave">
        Cadastre aqui uma vez e use em quantas peças quiser. Quando um fio
        acabar, <strong className="font-medium">desligue a cor</strong> em vez de
        apagar: ela some do site mas continua ligada às peças que já a usavam, e
        volta inteira quando você religar.
      </p>

      <div className="mt-respiro">
        <EditorDeOpcoes grupos={dados} />
      </div>
    </main>
  );
}
