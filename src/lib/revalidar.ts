import { revalidatePath } from "next/cache";

/**
 * Revalidação depois de uma alteração no painel.
 *
 * As páginas do site são geradas estaticamente — sem isto, a Raquel salva uma
 * peça e o site continua mostrando a versão antiga até o próximo deploy. Este
 * era o item pendente registrado na etapa 3.
 *
 * Revalidar demais é barato; revalidar de menos é um bug que ela vê e eu não.
 * Por isso cada função aqui é generosa no que invalida.
 */
export function revalidarCatalogo() {
  revalidatePath("/", "layout");
}

export function revalidarProduto(slug: string) {
  revalidatePath(`/produtos/${slug}`);
  revalidarCatalogo();
}
