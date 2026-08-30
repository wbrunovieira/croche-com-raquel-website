import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { AreaDeTexto, Campo, Marcador } from "@/components/admin/campos";
import { FormularioSimples } from "@/components/admin/formulario-simples";
import { salvarPagina } from "../../acoes-de-conteudo";

export default async function EditarPagina({ params }: PageProps<"/admin/paginas/[slug]">) {
  await exigirSessao();
  const { slug } = await params;
  const pagina = await db.page.findUnique({ where: { slug } });
  if (!pagina) notFound();

  return (
    <main className="container-site secao">
      <Link href="/admin/paginas" className="text-apoio text-conteudo-suave hover:text-conteudo">
        ← Textos do site
      </Link>

      <div className="mt-4 max-w-texto">
        <Etiqueta>/{pagina.slug}</Etiqueta>
        <h1 className="mt-2 font-display text-t1">{pagina.title}</h1>

        <div className="mt-respiro">
          <FormularioSimples acao={salvarPagina}>
            <input type="hidden" name="slug" value={pagina.slug} />
            <Campo id="title" rotulo="Título" defaultValue={pagina.title} required />
            <AreaDeTexto
              id="lead"
              rotulo="Frase de apoio"
              dica="Aparece logo abaixo do título."
              rows={2}
              defaultValue={pagina.lead ?? ""}
            />
            <AreaDeTexto
              id="content"
              rotulo="Conteúdo"
              dica="Linha em branco separa parágrafo. Use ## no começo da linha para subtítulo e **palavra** para negrito."
              rows={20}
              defaultValue={pagina.content}
              required
            />
            <AreaDeTexto
              id="seoDescription"
              rotulo="Descrição para o Google"
              dica="Até 160 caracteres. É o texto que aparece embaixo do link no resultado da busca."
              rows={3}
              defaultValue={pagina.seoDescription ?? ""}
            />
            <Marcador
              id="published"
              rotulo="Página visível no site"
              defaultChecked={pagina.published}
            />
          </FormularioSimples>
        </div>
      </div>
    </main>
  );
}
