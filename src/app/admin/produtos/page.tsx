import Link from "next/link";
import Image from "next/image";
import { CircleAlert, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Chip } from "@/components/ui/chip";
import { classesDeBotao } from "@/components/ui/botao";
import { formatarPreco } from "@/lib/formatar";

export default async function ListaDeProdutos({
  searchParams,
}: PageProps<"/admin/produtos">) {
  await exigirSessao();
  const { status } = await searchParams;
  const filtro = status === "DRAFT" || status === "PUBLISHED" ? status : undefined;

  const produtos = await db.product.findMany({
    where: filtro ? { status: filtro } : undefined,
    orderBy: [{ status: "asc" }, { position: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      status: true,
      featured: true,
      category: { select: { name: true } },
      subcategory: { select: { name: true } },
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } },
      _count: { select: { images: true } },
    },
  });

  const abas = [
    { rotulo: "Todas", href: "/admin/produtos", ativa: !filtro },
    { rotulo: "Ativas", href: "/admin/produtos?status=PUBLISHED", ativa: filtro === "PUBLISHED" },
    { rotulo: "Desativadas", href: "/admin/produtos?status=DRAFT", ativa: filtro === "DRAFT" },
  ];

  return (
    <main className="container-site secao">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Etiqueta>Catálogo</Etiqueta>
          <h1 className="mt-2 font-display text-t1">Peças</h1>
        </div>
        <Link href="/admin/produtos/nova" className={classesDeBotao()}>
          <Plus className="size-5" aria-hidden="true" />
          Nova peça
        </Link>
      </div>

      <nav aria-label="Filtrar" className="mt-bloco">
        <ul className="flex flex-wrap gap-2">
          {abas.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                aria-current={a.ativa ? "page" : undefined}
                className={`inline-block rounded-fio px-btn-sm-x py-btn-sm-y text-apoio transition-colors ${
                  a.ativa
                    ? "bg-primaria text-sobre-primaria"
                    : "border border-borda-forte hover:bg-superficie-baixa"
                }`}
              >
                {a.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="mt-bloco space-y-3">
        {produtos.map((p) => (
          <li key={p.id}>
            <Link
              href={`/admin/produtos/${p.id}`}
              className="flex items-center gap-4 rounded-card border border-borda bg-superficie p-3 transition-shadow hover:shadow-peca"
            >
              <span className="relative block size-16 shrink-0 overflow-hidden rounded-fio bg-superficie-baixa">
                {p.images[0] ? (
                  <Image
                    src={p.images[0].url}
                    alt={p.images[0].alt}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-conteudo-suave">
                    <CircleAlert className="size-5" aria-hidden="true" />
                  </span>
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-display text-lead leading-tight">{p.name}</span>
                <span className="mt-1 block text-apoio text-conteudo-suave">
                  {p.subcategory?.name ?? p.category.name} ·{" "}
                  {p.price === null ? "sob consulta" : formatarPreco(Number(p.price))} ·{" "}
                  {p._count.images === 0
                    ? "sem foto"
                    : `${p._count.images} ${p._count.images === 1 ? "foto" : "fotos"}`}
                </span>
              </span>

              <span className="flex shrink-0 flex-wrap items-center gap-2">
                {p.featured ? <Chip tom="neutro">Destaque</Chip> : null}
                <Chip tom={p.status === "PUBLISHED" ? "neutro" : "destaque"}>
                  {p.status === "PUBLISHED" ? "Ativa" : "Desativada"}
                </Chip>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {produtos.length === 0 ? (
        <p className="mt-bloco text-conteudo-suave">Nenhuma peça com esse filtro.</p>
      ) : null}
    </main>
  );
}
