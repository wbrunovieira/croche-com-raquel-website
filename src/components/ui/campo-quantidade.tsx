"use client";

export function CampoQuantidade({
  valor,
  aoMudar,
  maximo = 99,
}: {
  valor: number;
  aoMudar: (n: number) => void;
  maximo?: number;
}) {
  const limitar = (n: number) => Math.min(maximo, Math.max(1, n));
  // O − e o + são tocados em sequência: sem retorno ao toque, a pessoa não
  // sabe se o segundo toque pegou. `disabled:active` volta a zero para o botão
  // no limite não fingir que respondeu.
  const botao =
    "grid size-controle-sm place-items-center text-lead leading-none transition-[background-color,transform] duration-150 ease-fio active:scale-90 disabled:active:scale-100 hover:bg-superficie-baixa disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="inline-flex items-center rounded-fio border border-borda-forte">
      <button
        type="button"
        className={botao}
        onClick={() => aoMudar(limitar(valor - 1))}
        disabled={valor <= 1}
        aria-label="Diminuir quantidade"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={maximo}
        value={valor}
        onChange={(e) => aoMudar(limitar(Number(e.target.value) || 1))}
        aria-label="Quantidade"
        className="w-12 bg-transparent text-center tabular [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        className={botao}
        onClick={() => aoMudar(limitar(valor + 1))}
        disabled={valor >= maximo}
        aria-label="Aumentar quantidade"
      >
        +
      </button>
    </div>
  );
}
