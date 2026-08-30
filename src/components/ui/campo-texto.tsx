"use client";

/** Personalização — monograma, nome bordado. Grupo de opção do tipo TEXT. */
export function CampoTexto({
  id,
  valor,
  aoMudar,
  placeholder,
  maximo = 40,
  ajuda,
}: {
  id: string;
  valor: string;
  aoMudar: (v: string) => void;
  placeholder?: string;
  maximo?: number;
  ajuda?: string;
}) {
  return (
    <div>
      <input
        id={id}
        type="text"
        value={valor}
        maxLength={maximo}
        placeholder={placeholder}
        onChange={(e) => aoMudar(e.target.value)}
        className="h-controle w-full rounded-fio border border-borda-forte bg-superficie px-campo-x text-base placeholder:text-conteudo-suave/70"
      />
      <div className="mt-1 flex justify-between gap-4 text-legenda text-conteudo-suave">
        <span>{ajuda}</span>
        <span className="tabular shrink-0">
          {valor.length}/{maximo}
        </span>
      </div>
    </div>
  );
}
