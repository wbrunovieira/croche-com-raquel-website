import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Chip } from "@/components/ui/chip";
import { classesDeBotao } from "@/components/ui/botao";

/**
 * Lista de categorias.
 *
 * A contagem de peças aparece em cada linha porque ela decide duas coisas: se a
 * categoria aparece no site (categoria sem peça publicada não aparece) e se dá
 * para apagar (categoria com peça, não). Mostrar o número evita que a Raquel
 * descubra as duas regras errando.
 */
export default async function ListaDeCategorias() {
  await exigirSessao();

  const categorias = await db.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      active: true,
      position: true,
      _count: { select: { products: true } },
      capaProduto: {
        select: { images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } } },
      },
      products: {
        where: { status: "PUBLISHED", images: { some: {} } },
        orderBy: [{ featured: "desc" }, { featuredPosition: "asc" }, { position: "asc" }],
        take: 1,
        select: { images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } } },
      },
    },
  });

  return (
    // O layout do painel NÃO dá container aos filhos: cada tela se envolve no
    // próprio `<main>`. Sem ele, o conteúdo encosta nas duas bordas da janela e
    // o botão do canto sai cortado.
    <main className="container-site secao">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Etiqueta>Catálogo</Etiqueta>
          <h1 className="mt-2 font-display text-t1">Categorias</h1>
          <p className="mt-2 text-apoio text-conteudo-suave">
            A categoria organiza o catálogo e vira um filtro no site. Só aparece
            lá se tiver peça ativa dentro.
          </p>
        </div>
        <Link href="/admin/categorias/nova" className={classesDeBotao()}>
          <Plus className="size-4" aria-hidden="true" />
          Nova categoria
        </Link>
      </div>

      <ul className="mt-bloco space-y-3">
        {categorias.map((c) => {
          const foto = c.capaProduto?.images[0] ?? c.products[0]?.images[0];
          return (
            <li key={c.id}>
              <Link
                href={`/admin/categorias/${c.id}`}
                className="card-peca flex items-center gap-4 rounded-card border border-borda bg-superficie p-3"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-fio bg-superficie-baixa">
                  {foto ? (
                    <Image src={foto.url} alt="" fill sizes="56px" className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="mt-0.5 truncate text-apoio text-conteudo-suave">
                    {c._count.products}{" "}
                    {c._count.products === 1 ? "peça" : "peças"}
                    {c.description ? ` · ${c.description}` : ""}
                  </p>
                </div>
                <Chip tom={c.active ? "neutro" : "destaque"}>
                  {c.active ? "Ativa" : "Desativada"}
                </Chip>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
