import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { AreaDeTexto, Campo, Marcador } from "@/components/admin/campos";
import { ListaEditavel } from "@/components/admin/lista-editavel";
import { apagarDepoimento, salvarDepoimento } from "../acoes-de-conteudo";

function Campos({
  sufixo,
  nome = "",
  texto = "",
  cidade = "",
  posicao = 0,
  publicado,
}: {
  sufixo: string;
  nome?: string;
  texto?: string;
  cidade?: string;
  posicao?: number;
  publicado: boolean;
}) {
  return (
    <>
      <Campo id={`authorName-${sufixo}`} name="authorName" rotulo="Quem falou" defaultValue={nome} required />
      <AreaDeTexto id={`text-${sufixo}`} name="text" rotulo="O que disse" rows={4} defaultValue={texto} required />
      <Campo id={`city-${sufixo}`} name="city" rotulo="Cidade" defaultValue={cidade} />
      <Campo id={`position-${sufixo}`} name="position" rotulo="Ordem" type="number" min={0} defaultValue={posicao} />
      <Marcador id={`published-${sufixo}`} name="published" rotulo="Aparecer no site" defaultChecked={publicado} />
    </>
  );
}

export default async function PaginaDeDepoimentos() {
  await exigirSessao();
  const depoimentos = await db.testimonial.findMany({ orderBy: { position: "asc" } });

  return (
    <main className="container-site secao">
      <Etiqueta>Site</Etiqueta>
      <h1 className="mt-2 font-display text-t1">Depoimentos</h1>
      <p className="mt-4 max-w-texto text-leitura text-conteudo-suave">
        O que as clientes te mandam no WhatsApp depois de receber a peça. Peça
        autorização antes de publicar — e use o primeiro nome se ela preferir.
      </p>

      <div className="mt-respiro max-w-texto">
        <ListaEditavel
          itens={depoimentos.map((d) => ({
            id: d.id,
            titulo: d.authorName,
            resumo: `${d.text.slice(0, 80)}…`,
            publicado: d.published,
          }))}
          acaoDeSalvar={salvarDepoimento}
          acaoDeApagar={apagarDepoimento}
          rotuloDeNovo="Novo depoimento"
          perguntaAoApagar={(i) => `Apagar o depoimento de ${i.titulo}?`}
          camposDoItem={(item) => {
            const d = depoimentos.find((x) => x.id === item.id)!;
            return (
              <Campos
                sufixo={d.id}
                nome={d.authorName}
                texto={d.text}
                cidade={d.city ?? ""}
                posicao={d.position}
                publicado={d.published}
              />
            );
          }}
          camposDeNovo={<Campos sufixo="novo" publicado />}
        />
      </div>
    </main>
  );
}
