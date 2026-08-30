import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { CamposDaPergunta } from "./campos";
import { ListaEditavel } from "@/components/admin/lista-editavel";
import { apagarPergunta, salvarPergunta } from "../acoes-de-conteudo";

export default async function PaginaDePerguntas() {
  await exigirSessao();
  const perguntas = await db.faqItem.findMany({ orderBy: { position: "asc" } });

  return (
    <main className="container-site secao">
      <Etiqueta>Site</Etiqueta>
      <h1 className="mt-2 font-display text-t1">Perguntas frequentes</h1>
      <p className="mt-4 max-w-texto text-leitura text-conteudo-suave">
        Cada pergunta que você responde aqui é uma a menos no WhatsApp — e o
        Google mostra essas respostas direto no resultado da busca.
      </p>

      <div className="mt-respiro max-w-texto">
        <ListaEditavel
          itens={perguntas.map((p) => ({
            id: p.id,
            titulo: p.question,
            resumo: `${p.topic ?? "Geral"} · ${p.answer.slice(0, 70)}…`,
            publicado: p.published,
          }))}
          acaoDeSalvar={salvarPergunta}
          acaoDeApagar={apagarPergunta}
          rotuloDeNovo="Nova pergunta"
          perguntaAoApagar={(i) => `Apagar “${i.titulo}”?`}
          camposDoItem={(item) => {
            const p = perguntas.find((x) => x.id === item.id)!;
            return (
              <CamposDaPergunta
                sufixo={p.id}
                pergunta={p.question}
                resposta={p.answer}
                topico={p.topic ?? ""}
                posicao={p.position}
                publicada={p.published}
              />
            );
          }}
          camposDeNovo={<CamposDaPergunta sufixo="nova" publicada />}
        />
      </div>
    </main>
  );
}
