import { Etiqueta } from "@/components/ui/etiqueta";
import { TextoLongo } from "@/components/ui/texto-longo";
import type { PaginaInstitucional } from "@/lib/queries/paginas";

/** Molde das páginas de texto: Sobre, Cuidados, políticas. */
export function PaginaDeTexto({
  pagina,
  etiqueta,
  children,
}: {
  pagina: PaginaInstitucional;
  etiqueta?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="container-site secao">
      {etiqueta ? <Etiqueta>{etiqueta}</Etiqueta> : null}
      <h1 className="mt-2 max-w-[20ch] font-display text-t1">{pagina.titulo}</h1>
      {pagina.chamada ? (
        <p className="mt-4 max-w-texto text-lead text-conteudo-suave">
          {pagina.chamada}
        </p>
      ) : null}

      <div className="corrente mt-bloco max-w-texto" aria-hidden="true" />

      <div className="mt-bloco">
        <TextoLongo texto={pagina.corpo} />
      </div>

      {children}
    </main>
  );
}
