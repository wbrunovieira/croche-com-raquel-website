import Link from "next/link";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { FormularioDeNovaPeca } from "./formulario";

export default async function NovaPeca() {
  await exigirSessao();
  const categorias = await db.category.findMany({ orderBy: { position: "asc" } });

  return (
    <main className="container-site secao">
      <Link href="/admin/produtos" className="text-apoio text-conteudo-suave hover:text-conteudo">
        ← Peças
      </Link>
      <div className="mt-4 max-w-texto">
        <Etiqueta>Nova</Etiqueta>
        <h1 className="mt-2 font-display text-t1">Começar uma peça</h1>
        <p className="mt-3 text-leitura text-conteudo-suave">
          Só o nome e a categoria por enquanto. A peça nasce como rascunho e o
          resto você preenche na tela seguinte — ela só vai ao ar quando você
          mandar.
        </p>

        <div className="mt-respiro">
          <FormularioDeNovaPeca
            categorias={categorias.map((c) => ({ id: c.id, nome: c.name }))}
          />
        </div>
      </div>
    </main>
  );
}
