/** Slug a partir do nome: minúsculas, sem acento, hífen no lugar de espaço. */
export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Garante slug único. Se "bolsa-serra" já existe, vira "bolsa-serra-2".
 * A URL da peça é o que a Raquel manda no WhatsApp, então ela não pode mudar
 * sozinha nem colidir com outra.
 */
export async function slugUnico(
  base: string,
  existe: (slug: string) => Promise<boolean>
): Promise<string> {
  const raiz = gerarSlug(base) || "peca";
  if (!(await existe(raiz))) return raiz;
  for (let i = 2; i < 100; i++) {
    const tentativa = `${raiz}-${i}`;
    if (!(await existe(tentativa))) return tentativa;
  }
  return `${raiz}-${Date.now()}`;
}
