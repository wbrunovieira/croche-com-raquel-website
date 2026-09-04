import { Etiqueta } from "@/components/ui/etiqueta";
import { Revelar } from "@/components/ui/revelar";
import { TextoLongo } from "@/components/ui/texto-longo";
import type { PaginaInstitucional } from "@/lib/queries/paginas";

/** Cuidados com a peça. O texto vem do banco: é ela quem sabe, e muda. */
export function SecaoCuidados({ pagina }: { pagina: PaginaInstitucional | null }) {
  if (!pagina) return null;

  return (
    <section id="cuidados" className="container-site secao scroll-mt-cabecalho-lg">
      <Revelar className="max-w-texto">
        <Etiqueta>Cuidados</Etiqueta>
        <h2 className="mt-2 font-display text-t2">{pagina.titulo}</h2>
        {pagina.chamada ? (
          <p className="mt-4 text-lead text-conteudo-suave">{pagina.chamada}</p>
        ) : null}
        <div className="mt-bloco">
          <TextoLongo texto={pagina.corpo} />
        </div>
      </Revelar>
    </section>
  );
}
