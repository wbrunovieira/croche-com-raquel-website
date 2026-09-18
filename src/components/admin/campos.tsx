import type { ComponentProps } from "react";

const CAMPO =
  "w-full rounded-fio border border-borda-forte bg-superficie px-campo-x text-base disabled:opacity-60";

/**
 * O `id` da dica, derivado do campo — é o que o `aria-describedby` aponta.
 *
 * **A dica era invisível para leitor de tela.** Ela é um `<p>` irmão do
 * `<label>`, sem ligação nenhuma com o input: focar o campo anunciava o rótulo e
 * nada mais. E a dica mais importante do painel é justamente a do preço —
 * *"Deixe em branco para a peça aparecer como sob consulta"* —, que explica um
 * comportamento que ninguém adivinha.
 */
const idDaDica = (id: string) => `${id}-dica`;

export function Rotulo({
  htmlFor,
  children,
  dica,
}: {
  htmlFor: string;
  children: React.ReactNode;
  dica?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-apoio font-medium">
        {children}
      </label>
      {dica ? (
        <p id={idDaDica(htmlFor)} className="mt-1 text-legenda text-conteudo-suave">
          {dica}
        </p>
      ) : null}
    </div>
  );
}

export function Campo({
  rotulo,
  dica,
  id,
  className = "",
  ...props
}: { rotulo: string; dica?: string; id: string } & ComponentProps<"input">) {
  return (
    <div className="mt-bloco first:mt-0">
      <Rotulo htmlFor={id} dica={dica}>
        {rotulo}
      </Rotulo>
      <input
        id={id}
        name={id}
        aria-describedby={dica ? idDaDica(id) : undefined} className={`${CAMPO} mt-2 h-controle ${className}`} {...props} />
    </div>
  );
}

export function AreaDeTexto({
  rotulo,
  dica,
  id,
  rows = 5,
  className = "",
  ...props
}: { rotulo: string; dica?: string; id: string } & ComponentProps<"textarea">) {
  return (
    <div className="mt-bloco first:mt-0">
      <Rotulo htmlFor={id} dica={dica}>
        {rotulo}
      </Rotulo>
      <textarea
        id={id}
        name={id}
        aria-describedby={dica ? idDaDica(id) : undefined}
        rows={rows}
        className={`${CAMPO} mt-2 py-campo-y ${className}`}
        {...props}
      />
    </div>
  );
}

export function Selecao({
  rotulo,
  dica,
  id,
  children,
  ...props
}: { rotulo: string; dica?: string; id: string } & ComponentProps<"select">) {
  return (
    <div className="mt-bloco first:mt-0">
      <Rotulo htmlFor={id} dica={dica}>
        {rotulo}
      </Rotulo>
      <select
        id={id}
        name={id}
        aria-describedby={dica ? idDaDica(id) : undefined} className={`${CAMPO} mt-2 h-controle`} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Marcador({
  rotulo,
  dica,
  id,
  ...props
}: { rotulo: string; dica?: string; id: string } & ComponentProps<"input">) {
  return (
    <div className="mt-bloco flex items-start gap-3 first:mt-0">
      <input
        id={id}
        name={id}
        type="checkbox"
        className="mt-1 size-5 shrink-0 rounded-fio border-borda-forte accent-verde-cristal"
        {...props}
      />
      <Rotulo htmlFor={id} dica={dica}>
        {rotulo}
      </Rotulo>
    </div>
  );
}

export function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-respiro rounded-card border border-borda bg-superficie p-painel first:mt-0">
      <h2 className="font-display text-t3">{titulo}</h2>
      {descricao ? (
        <p className="mt-2 max-w-texto text-apoio text-conteudo-suave">{descricao}</p>
      ) : null}
      <div className="mt-bloco">{children}</div>
    </section>
  );
}
