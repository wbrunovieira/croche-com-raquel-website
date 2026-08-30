import { AreaDeTexto, Campo, Marcador } from "@/components/admin/campos";

export function CamposDaPergunta({
  sufixo,
  pergunta = "",
  resposta = "",
  topico = "",
  posicao = 0,
  publicada,
}: {
  sufixo: string;
  pergunta?: string;
  resposta?: string;
  topico?: string;
  posicao?: number;
  publicada: boolean;
}) {
  return (
    <>
      <Campo
        id={`question-${sufixo}`}
        name="question"
        rotulo="Pergunta"
        defaultValue={pergunta}
        required
      />
      <AreaDeTexto
        id={`answer-${sufixo}`}
        name="answer"
        rotulo="Resposta"
        rows={5}
        defaultValue={resposta}
        required
      />
      <Campo
        id={`topic-${sufixo}`}
        name="topic"
        rotulo="Assunto"
        dica="Agrupa as perguntas na tela: Encomenda, Envio, Prazo…"
        defaultValue={topico}
      />
      <Campo
        id={`position-${sufixo}`}
        name="position"
        rotulo="Ordem"
        type="number"
        min={0}
        defaultValue={posicao}
      />
      <Marcador
        id={`published-${sufixo}`}
        name="published"
        rotulo="Aparecer no site"
        defaultChecked={publicada}
      />
    </>
  );
}
