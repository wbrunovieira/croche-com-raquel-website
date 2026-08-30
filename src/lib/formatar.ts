/** Preço em reais. Nulo é "sob consulta" — nunca vira R$ 0,00. */
export function formatarPreco(valor: number | null): string {
  if (valor === null) return "Sob consulta";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: valor % 1 === 0 ? 0 : 2,
  });
}

/** "Pronta em 7 a 10 dias" · "Pronta em 7 dias" · null quando não há prazo. */
export function formatarPrazo(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null && min !== max) {
    return `Pronta em ${min} a ${max} dias`;
  }
  const dias = min ?? max!;
  return `Pronta em ${dias} ${dias === 1 ? "dia" : "dias"}`;
}
