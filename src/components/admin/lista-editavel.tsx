"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { classesDeBotao } from "@/components/ui/botao";
import { FormularioSimples, BotaoDeApagar } from "@/components/admin/formulario-simples";

type Acao = (anterior: unknown, dados: FormData) => Promise<{ erro?: string; ok?: string }>;

export type ItemEditavel = {
  id: string;
  titulo: string;
  resumo: string;
  publicado: boolean;
};

/**
 * Lista de itens curtos com edição em linha — perguntas e depoimentos.
 * Uma tela separada para cada item seria um clique a mais em cada ajuste,
 * e esses textos costumam ser editados em lote.
 */
export function ListaEditavel({
  itens,
  acaoDeSalvar,
  acaoDeApagar,
  camposDoItem,
  camposDeNovo,
  rotuloDeNovo,
  perguntaAoApagar,
}: {
  itens: ItemEditavel[];
  acaoDeSalvar: Acao;
  acaoDeApagar: (id: string) => Promise<void>;
  camposDoItem: (item: ItemEditavel) => React.ReactNode;
  camposDeNovo: React.ReactNode;
  rotuloDeNovo: string;
  perguntaAoApagar: (item: ItemEditavel) => string;
}) {
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [novo, setNovo] = useState(false);
  const [pendente, iniciar] = useTransition();

  function alternar(id: string) {
    setAbertos((antigo) => {
      const novoConjunto = new Set(antigo);
      if (novoConjunto.has(id)) novoConjunto.delete(id);
      else novoConjunto.add(id);
      return novoConjunto;
    });
  }

  return (
    <div>
      <ul className="space-y-3">
        {itens.map((item) => {
          const aberto = abertos.has(item.id);
          return (
            <li
              key={item.id}
              className={`rounded-card border border-borda bg-superficie p-painel ${
                item.publicado ? "" : "opacity-60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.titulo}</p>
                  <p className="mt-1 text-apoio text-conteudo-suave">
                    {item.resumo}
                    {item.publicado ? "" : " · escondido"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alternar(item.id)}
                  className={classesDeBotao("secundaria", "sm")}
                >
                  {aberto ? "Fechar" : "Editar"}
                </button>
              </div>

              {aberto ? (
                <div className="mt-bloco border-t border-borda pt-6">
                  <FormularioSimples acao={acaoDeSalvar}>
                    <input type="hidden" name="id" value={item.id} />
                    {camposDoItem(item)}
                  </FormularioSimples>
                  <div className="mt-bloco border-t border-borda pt-4">
                    <BotaoDeApagar
                      pergunta={perguntaAoApagar(item)}
                      aoConfirmar={() => iniciar(() => acaoDeApagar(item.id))}
                    />
                    {pendente ? (
                      <span className="ml-3 text-apoio text-conteudo-suave">Apagando…</span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-respiro">
        {novo ? (
          <div className="rounded-card border border-borda-forte bg-superficie p-painel">
            <h2 className="font-display text-t3">{rotuloDeNovo}</h2>
            <div className="mt-bloco">
              <FormularioSimples acao={acaoDeSalvar} rotulo="Criar">
                {camposDeNovo}
              </FormularioSimples>
            </div>
            <button
              type="button"
              onClick={() => setNovo(false)}
              className={`${classesDeBotao("secundaria", "sm")} mt-bloco`}
            >
              Fechar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setNovo(true)}
            className={classesDeBotao("secundaria")}
          >
            <Plus className="size-5" aria-hidden="true" />
            {rotuloDeNovo}
          </button>
        )}
      </div>
    </div>
  );
}
