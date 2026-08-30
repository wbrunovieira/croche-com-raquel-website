"use client";

import type { ValorDeOpcao } from "@/lib/queries/tipos";

/**
 * Seletor de cor da página do produto.
 *
 * Mostra a bolinha, não o nome: fio tingido se escolhe pelo olho. O nome fica
 * embaixo, para quem depende de leitor de tela e para quem quer conferir.
 *
 * A cor selecionada é marcada por um anel FORA da bolinha, não por uma borda
 * dentro dela — uma borda interna muda a cor que a pessoa está avaliando.
 */
export function SeletorDeCor({
  valores,
  selecionado,
  aoSelecionar,
  nomeDoGrupo = "Cor",
}: {
  valores: ValorDeOpcao[];
  selecionado: string | null;
  aoSelecionar: (slug: string) => void;
  nomeDoGrupo?: string;
}) {
  const atual = valores.find((v) => v.slug === selecionado) ?? null;

  return (
    <div>
      <div role="radiogroup" aria-label={nomeDoGrupo} className="flex flex-wrap gap-3">
        {valores.map((v) => {
          const ativo = v.slug === selecionado;
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={ativo}
              aria-label={v.nome}
              title={v.nome}
              onClick={() => aoSelecionar(v.slug)}
              className={`size-controle-sm rounded-pilula border border-borda-forte/40 transition-shadow ${
                ativo ? "ring-2 ring-conteudo ring-offset-2 ring-offset-fundo" : ""
              }`}
              style={{ backgroundColor: v.hex ?? "transparent" }}
            />
          );
        })}
      </div>
      <p className="mt-2 text-apoio" aria-live="polite">
        {atual ? (
          <span>{atual.nome}</span>
        ) : (
          <span className="text-conteudo-suave">Escolha uma cor</span>
        )}
      </p>
    </div>
  );
}
