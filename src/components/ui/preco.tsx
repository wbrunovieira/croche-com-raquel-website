import { formatarPreco } from "@/lib/formatar";

/**
 * Preço nulo é "Sob consulta", não R$ 0,00 — boa parte das peças é orçada caso
 * a caso. Este componente existe para que essa regra viva em um lugar só.
 */
export function Preco({
  valor,
  className = "",
}: {
  valor: number | null;
  className?: string;
}) {
  if (valor === null) {
    return <span className={`text-conteudo-suave ${className}`}>Sob consulta</span>;
  }
  return <span className={`tabular ${className}`}>{formatarPreco(valor)}</span>;
}
