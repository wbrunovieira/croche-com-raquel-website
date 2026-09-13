/**
 * As peças de demonstração.
 *
 * Elas existem para a Raquel ver a estrutura do catálogo antes de cadastrar o
 * acervo dela — quatro categorias estavam vazias, e categoria vazia não aparece
 * no site. Apagá-las é decisão dela, no painel, quando as peças reais entrarem.
 *
 * **Mas o buscador não pode vê-las.** São oito peças com a mesma descrição e a
 * mesma foto: num sitemap de dezenove URLs, elas seriam 42% do que o Google
 * rastreia na primeira visita — e o que ele veria é conteúdo repetido. A
 * primeira impressão de um site novo não se refaz depois.
 *
 * Então elas ficam VISÍVEIS no site e FORA do buscador: sem entrar no sitemap e
 * com `noindex` na própria página. Quando a Raquel apagar, nada aqui precisa
 * mudar — a regra é o prefixo do slug, e sem peça com esse prefixo ela deixa de
 * valer sozinha.
 */
export const PREFIXO_DE_DEMONSTRACAO = "exemplo-";

export function ehDemonstracao(slug: string): boolean {
  return slug.startsWith(PREFIXO_DE_DEMONSTRACAO);
}
