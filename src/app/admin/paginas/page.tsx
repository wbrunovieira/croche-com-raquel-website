import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Chip } from "@/components/ui/chip";

export default async function ListaDePaginas() {
  await exigirSessao();
  const paginas = await db.page.findMany({ orderBy: { title: "asc" } });

  return (
    <main className="container-site secao">
      <Etiqueta>Site</Etiqueta>
      <h1 className="mt-2 font-display text-t1">Textos do site</h1>
      <p className="mt-4 max-w-texto text-leitura text-conteudo-suave">
        As páginas escritas: quem faz, cuidados com as peças e as políticas.
      </p>

      <ul className="mt-respiro max-w-texto space-y-3">
        {paginas.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/admin/paginas/${p.slug}`}
              className="group flex items-center justify-between gap-4 rounded-card border border-borda bg-superficie p-painel transition-shadow hover:shadow-peca"
            >
              <span>
                <span className="block font-display text-lead">{p.title}</span>
                <span className="mt-1 block text-apoio text-conteudo-suave">/{p.slug}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                {p.published ? null : <Chip>Escondida</Chip>}
                <ArrowRight
                  className="size-5 text-conteudo-suave transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
