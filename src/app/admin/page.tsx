import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";

export default async function PaginaDoAdmin() {
  const usuario = await exigirSessao();

  const [publicados, foraDoAr, semFoto, cores, coresDesligadas] =
    await Promise.all([
      db.product.count({ where: { status: "PUBLISHED" } }),
      db.product.count({ where: { status: "DRAFT" } }),
      db.product.count({ where: { images: { none: {} } } }),
      db.optionValue.count({ where: { group: { slug: "cor" }, active: true } }),
      db.optionValue.count({ where: { group: { slug: "cor" }, active: false } }),
    ]);

  const numeros = [
    { rotulo: "Peças no ar", valor: publicados, href: "/admin/produtos" },
    { rotulo: "Fora do ar", valor: foraDoAr, href: "/admin/produtos?status=DRAFT" },
    { rotulo: "Cores ativas", valor: cores, href: "/admin/opcoes" },
    { rotulo: "Cores desligadas", valor: coresDesligadas, href: "/admin/opcoes" },
  ];

  return (
    <main className="container-site secao">
      <Etiqueta>Painel</Etiqueta>
      <h1 className="mt-2 font-display text-t1">Oi, {usuario.name?.split(" ")[0]}</h1>

      {semFoto > 0 ? (
        <div className="mt-bloco flex max-w-texto items-start gap-3 rounded-card border border-borda bg-goiaba-clara p-painel">
          <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-apoio">
            {semFoto === 1
              ? "1 peça está sem foto."
              : `${semFoto} peças estão sem foto.`}{" "}
            Peça sem foto aparece com um espaço vazio no site.{" "}
            <Link href="/admin/produtos" className="underline underline-offset-4">
              Ver quais
            </Link>
          </p>
        </div>
      ) : null}

      <ul className="mt-respiro grid gap-x-grade-col gap-y-grade-linha sm:grid-cols-2 lg:grid-cols-3">
        {numeros.map((n) => (
          <li key={n.rotulo}>
            <Link
              href={n.href}
              className="group flex items-center justify-between gap-4 rounded-card border border-borda bg-superficie p-painel transition-shadow hover:shadow-peca"
            >
              <span>
                <span className="block font-display text-t1 tabular">{n.valor}</span>
                <span className="mt-1 block text-apoio text-conteudo-suave">
                  {n.rotulo}
                </span>
              </span>
              <ArrowRight
                className="size-5 shrink-0 text-conteudo-suave transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
