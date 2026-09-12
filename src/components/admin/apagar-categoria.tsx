"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { apagarCategoria } from "@/app/admin/categorias/acoes";
import { classesDeBotao } from "@/components/ui/botao";

/**
 * Apagar categoria — com confirmação e com a saída boa em evidência.
 *
 * Categoria com peça dentro não é apagada, e o botão nem finge que seria: ele
 * explica a diferença entre apagar e desativar, que é a distinção que importa
 * aqui. Desativar tira do site e não perde nada; apagar levaria as peças junto,
 * e peça é semana de crochê.
 *
 * A confirmação é em duas etapas no próprio lugar, e não um `confirm()` do
 * navegador: o `confirm()` não diz QUANTAS peças estão em jogo, e é justamente
 * esse número que muda a decisão.
 */
export function ApagarCategoria({
  id,
  nome,
  totalDePecas,
}: {
  id: string;
  nome: string;
  totalDePecas: number;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  if (totalDePecas > 0) {
    return (
      <p className="text-apoio text-conteudo-suave">
        Esta categoria não pode ser apagada porque tem{" "}
        <strong className="font-medium">
          {totalDePecas} {totalDePecas === 1 ? "peça" : "peças"}
        </strong>{" "}
        dentro — apagar levaria as peças junto. Para tirá-la do site, desmarque
        “Categoria ativa” aqui em cima: ela some do site e nada se perde.
      </p>
    );
  }

  return (
    <div>
      {erro ? (
        <p role="alert" className="mb-3 rounded-fio bg-goiaba-clara px-4 py-3 text-apoio">
          {erro}
        </p>
      ) : null}

      {confirmando ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-apoio">
            Apagar “{nome}” de vez? Isto não tem volta.
          </p>
          <button
            type="button"
            disabled={pendente}
            onClick={() =>
              iniciar(async () => {
                const r = await apagarCategoria(id);
                if (r?.erro) {
                  setErro(r.erro);
                  setConfirmando(false);
                }
              })
            }
            className={classesDeBotao("secundaria", "sm")}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {pendente ? "Apagando…" : "Sim, apagar"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className={classesDeBotao("texto", "sm")}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className={classesDeBotao("texto", "sm")}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Apagar categoria
        </button>
      )}
    </div>
  );
}
