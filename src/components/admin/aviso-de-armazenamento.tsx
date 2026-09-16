import { TriangleAlert } from "lucide-react";
import { r2Configurado } from "@/lib/r2";

/**
 * Avisa a Raquel, ANTES do formulário, quando o envio de foto não vai funcionar.
 *
 * **Por que existe.** Em 16/09/2026 o armazenamento foi suspenso e ela ficou sem
 * conseguir cadastrar. O que ela via era isto: entrava, digitava o nome, a
 * descrição, escolhia a categoria, anexava as fotos — e só no ÚLTIMO clique
 * recebia *"Vercel Blob: This store has been suspended"*. Em inglês, técnico, sem
 * dizer o que fazer, e com o trabalho todo perdido.
 *
 * **Falhar no fim é a pior hora de falhar.** Quem não está à vontade com o
 * painel conclui que quebrou alguma coisa — e não foi ela: o consumo que estourou
 * a cota veio de outro projeto da conta.
 *
 * O aviso não bloqueia nada. Peça sem foto é cadastro legítimo: ela pode
 * registrar a peça agora e anexar as fotos depois, e é isso que o texto oferece.
 */
export function AvisoDeArmazenamento() {
  if (r2Configurado()) return null;

  return (
    <div
      role="status"
      className="mt-respiro flex gap-3 rounded-card border border-borda-forte bg-goiaba-clara p-painel"
    >
      <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-medium">O envio de fotos está fora do ar agora.</p>
        <p className="mt-2 text-apoio">
          Não é nada que você fez — é o armazenamento das imagens, e já estamos
          resolvendo. Você pode cadastrar a peça normalmente <strong>sem as
          fotos</strong> e anexá-las depois: basta abrir a peça e escolher as
          imagens quando isto voltar.
        </p>
        <p className="mt-2 text-apoio">
          Se anexar agora, o cadastro não salva e o que você escreveu se perde.
        </p>
      </div>
    </div>
  );
}
