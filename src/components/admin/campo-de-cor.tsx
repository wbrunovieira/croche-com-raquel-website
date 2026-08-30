"use client";

import { useId, useState } from "react";

export type DadosDaCor = {
  nome: string;
  hex: string;
  linhaDoFio: string;
  codigoDaCor: string;
  ativa: boolean;
};

const HEX_VALIDO = /^#[0-9a-fA-F]{6}$/;

function normalizarHex(entrada: string): string | null {
  let v = entrada.trim();
  if (v === "") return null;
  if (!v.startsWith("#")) v = `#${v}`;
  // Aceita a forma curta (#abc), que muita paleta usa.
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  }
  return HEX_VALIDO.test(v) ? v.toUpperCase() : null;
}

/**
 * Cadastro de uma cor no admin.
 *
 * Três informações, com papéis diferentes — e a distinção importa:
 *
 *  - **hex** é para a TELA. Desenha a bolinha do seletor. A Raquel escolhe na
 *    roda de cores do sistema ou cola o código, e os dois caminhos gravam aqui.
 *  - **linha do fio** e **código da cor** são para a COMPRA. É por eles que ela
 *    recompra e garante que a peça nova sai igual à da foto. Não dá para
 *    confiar no hex para isso: a mesma "terracota" muda de tom entre linhas.
 *
 * O botão de desabilitar existe porque apagar seria destrutivo: apagar tiraria
 * a cor de todos os produtos que já a usavam. Desligada, ela some do site e
 * volta inteira quando a Raquel religar.
 */
export function CampoDeCor({
  valor,
  aoMudar,
}: {
  valor: DadosDaCor;
  aoMudar: (v: DadosDaCor) => void;
}) {
  const id = useId();
  const [hexDigitado, setHexDigitado] = useState(valor.hex);
  const hexInvalido = hexDigitado.trim() !== "" && normalizarHex(hexDigitado) === null;

  function mudarHex(bruto: string) {
    setHexDigitado(bruto);
    const limpo = normalizarHex(bruto);
    if (limpo) aoMudar({ ...valor, hex: limpo });
  }

  function mudarPelaRoda(hex: string) {
    const limpo = hex.toUpperCase();
    setHexDigitado(limpo);
    aoMudar({ ...valor, hex: limpo });
  }

  const rotulo = "mb-1 block text-apoio text-conteudo-suave";
  const campo =
    "h-controle w-full rounded-fio border border-borda-forte bg-superficie px-campo-x text-base";

  return (
    <div
      className={`rounded-card border border-borda bg-superficie p-painel ${
        valor.ativa ? "" : "opacity-60"
      }`}
    >
      <div className="flex flex-wrap items-start gap-6">
        {/* A roda de cores do sistema. O input nativo abre o seletor do SO —
            é o que ela já conhece, e funciona no celular. */}
        <div className="shrink-0">
          <label className={rotulo} htmlFor={`${id}-roda`}>
            Roda de cores
          </label>
          <input
            id={`${id}-roda`}
            type="color"
            value={HEX_VALIDO.test(valor.hex) ? valor.hex : "#000000"}
            onChange={(e) => mudarPelaRoda(e.target.value)}
            className="size-20 cursor-pointer rounded-card border border-borda-forte bg-transparent p-1"
          />
        </div>

        <div className="min-w-52 flex-1">
          <label className={rotulo} htmlFor={`${id}-nome`}>
            Nome da cor
          </label>
          <input
            id={`${id}-nome`}
            type="text"
            value={valor.nome}
            placeholder="Terracota"
            onChange={(e) => aoMudar({ ...valor, nome: e.target.value })}
            className={campo}
          />
        </div>

        <div className="min-w-40">
          <label className={rotulo} htmlFor={`${id}-hex`}>
            Código da tela (hex)
          </label>
          <input
            id={`${id}-hex`}
            type="text"
            value={hexDigitado}
            placeholder="#B05A3C"
            spellCheck={false}
            onChange={(e) => mudarHex(e.target.value)}
            aria-invalid={hexInvalido}
            aria-describedby={hexInvalido ? `${id}-hex-erro` : undefined}
            className={`${campo} font-mono uppercase ${
              hexInvalido ? "border-erro" : ""
            }`}
          />
          {hexInvalido ? (
            <p id={`${id}-hex-erro`} className="mt-1 text-legenda text-erro">
              Use o formato #RRGGBB.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-bloco border-t border-borda pt-6">
        <p className="text-apoio text-conteudo-suave">
          Ficha do fio — é por ela que você recompra e garante que a peça nova
          sai igual à da foto. O código da tela acima serve só para desenhar a
          bolinha no site.
        </p>
        <div className="mt-4 flex flex-wrap gap-6">
          <div className="min-w-52 flex-1">
            <label className={rotulo} htmlFor={`${id}-linha`}>
              Linha do fio
            </label>
            <input
              id={`${id}-linha`}
              type="text"
              value={valor.linhaDoFio}
              placeholder="Barroco Maxcolor 400g"
              onChange={(e) => aoMudar({ ...valor, linhaDoFio: e.target.value })}
              className={campo}
            />
          </div>
          <div className="min-w-40">
            <label className={rotulo} htmlFor={`${id}-codigo`}>
              Código da cor
            </label>
            <input
              id={`${id}-codigo`}
              type="text"
              value={valor.codigoDaCor}
              placeholder="7684"
              onChange={(e) => aoMudar({ ...valor, codigoDaCor: e.target.value })}
              className={`${campo} tabular`}
            />
          </div>
        </div>
      </div>

      <div className="mt-bloco flex flex-wrap items-center justify-between gap-4 border-t border-borda pt-6">
        <p className="text-apoio text-conteudo-suave">
          {valor.ativa
            ? "Aparecendo no site."
            : "Desabilitada — some das páginas, mas continua ligada aos produtos que já a usavam."}
        </p>
        <button
          type="button"
          onClick={() => aoMudar({ ...valor, ativa: !valor.ativa })}
          className="rounded-fio border border-borda-forte px-btn-x py-btn-y text-apoio font-medium transition-colors hover:bg-superficie-baixa"
        >
          {valor.ativa ? "Desabilitar cor" : "Reativar cor"}
        </button>
      </div>
    </div>
  );
}
