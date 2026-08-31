import { formatarPreco } from "@/lib/formatar";

/**
 * Preço nulo é "Sob consulta", não R$ 0,00 — boa parte das peças é orçada caso
 * a caso. Este componente existe para que essa regra viva em um lugar só.
 *
 * O `data-preco` carrega o valor cru (ou `sob-consulta`). É por ele que o
 * `pnpm check:seo` confere que a oferta declarada no JSON-LD é a mesma coisa
 * que a página mostra para a cliente — as duas nunca podem divergir.
 */
export function Preco({
  valor,
  className = "",
}: {
  valor: number | null;
  className?: string;
}) {
  if (valor === null) {
    return (
      <span data-preco="sob-consulta" className={`text-conteudo-suave ${className}`}>
        Sob consulta
      </span>
    );
  }
  return (
    <span data-preco={valor.toFixed(2)} className={`tabular ${className}`}>
      {formatarPreco(valor)}
    </span>
  );
}
