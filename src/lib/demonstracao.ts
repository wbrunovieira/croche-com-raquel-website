/**
 * As peças de demonstração.
 *
 * Elas existem para a Raquel ver a estrutura do catálogo antes de cadastrar o
 * acervo — quatro categorias estavam vazias, e categoria vazia não aparece no
 * site. O buscador não deve vê-las: são peças com a mesma descrição e a mesma
 * foto, e num sitemap pequeno elas seriam quase metade do que o Google rastreia
 * na primeira visita.
 *
 * **O marcador é a FOTO, e a primeira versão errou nisso.**
 *
 * Eu marcava pelo prefixo do slug (`exemplo-`). Parecia estável e era o
 * contrário: o slug é gerado uma vez, na criação, e NÃO muda quando a peça é
 * renomeada — essa imutabilidade existe de propósito, para não quebrar link que
 * já circulou. Então quando a Raquel transformou três exemplos em peças reais
 * pelo painel — "Jogo de banheiro" com onze fotos, "Jogo de cozinha", "Bolsa de
 * crochê infantil" —, elas continuaram com slug de exemplo, e **a minha regra
 * escondeu o trabalho real dela do Google**.
 *
 * A foto de exemplo é o oposto: ela é a primeira coisa que ela troca, porque é
 * o que aparece na tela. Marcar por ela faz a regra se desfazer sozinha no
 * momento exato em que deixa de ser verdade.
 */

/** O arquivo que o `scripts/gerar-foto-exemplo.mjs` produz. */
const FOTO_DE_EXEMPLO = "exemplo.jpg";

/**
 * A peça ainda é demonstração?
 *
 * Sem foto nenhuma também conta: peça sem foto não vai ao ar e não tem o que
 * mostrar ao buscador.
 */
export function ehDemonstracao(capaUrl: string | null | undefined): boolean {
  if (!capaUrl) return true;
  return capaUrl.includes(FOTO_DE_EXEMPLO);
}
