"use client";

import type { ValorDeOpcao } from "@/lib/queries/tipos";

/** Opção sem cor — tamanho, alça, forro, fecho. Pílulas com o nome. */
export function SeletorDeOpcao({
  valores,
  selecionado,
  aoSelecionar,
  nomeDoGrupo,
}: {
  valores: ValorDeOpcao[];
  selecionado: string | null;
  aoSelecionar: (slug: string) => void;
  nomeDoGrupo: string;
}) {
  return (
    <div role="radiogroup" aria-label={nomeDoGrupo} className="flex flex-wrap gap-2">
      {valores.map((v) => {
        const ativo = v.slug === selecionado;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => aoSelecionar(v.slug)}
            // Estes são os controles mais tocados do site: é por eles que o
            // pedido se monta. `active:translate-y-px` é o retorno do toque —
            // no celular o `hover:` do Tailwind v4 não existe.
            className={`rounded-fio px-btn-sm-x py-btn-sm-y text-apoio transition-[color,background-color,border-color,transform] duration-150 ease-fio active:translate-y-px ${
              ativo
                ? "bg-primaria text-sobre-primaria"
                : "border border-borda-forte hover:bg-superficie-baixa"
            }`}
          >
            {v.nome}
          </button>
        );
      })}
    </div>
  );
}
