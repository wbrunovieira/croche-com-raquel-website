import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { FormularioDeCategoria } from "@/components/admin/formulario-de-categoria";

export default async function NovaCategoria() {
  await exigirSessao();
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
        <h1 className="mt-2 font-display text-t2">Nova categoria</h1>
      </div>
      <div className="mt-bloco max-w-texto">
        {/* Sem escolha de capa aqui: a categoria nasce vazia, e não há peça
            dentro dela para escolher. A capa aparece na edição. */}
        <FormularioDeCategoria />
      </div>
    </>
  );
}
