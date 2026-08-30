/**
 * Montagem da mensagem de WhatsApp.
 *
 * Este é o ponto de conversão do site inteiro: é o que a cliente envia e o que
 * a Raquel recebe. Duas coisas não podem faltar na mensagem — QUAL peça e COM
 * QUAIS escolhas — porque sem elas a Raquel precisa perguntar tudo de novo, que
 * é exatamente o atrito que o site existe para remover.
 *
 * Função pura, sem acesso a banco: roda igual no servidor e no navegador.
 */

export type EscolhaDoCliente = {
  /** Nome do grupo como a cliente viu: "Cor", "Tamanho". */
  grupo: string;
  /** Valor escolhido, ou o texto que ela digitou na personalização. */
  valor: string;
};

export type DadosDaMensagem = {
  produto: string;
  /** Identificador curto da peça, derivado do slug: BOLSA-SERRA. */
  codigo: string;
  escolhas: EscolhaDoCliente[];
  quantidade: number;
  /** URL absoluta da página do produto. */
  link: string;
};

/** Marcadores aceitos no template editável do admin. */
const MARCADORES = ["produto", "codigo", "opcoes", "quantidade", "link"] as const;

export function codigoDoProduto(slug: string): string {
  return slug.toUpperCase();
}

export function montarMensagem(template: string, dados: DadosDaMensagem): string {
  const opcoes = dados.escolhas
    .filter((e) => e.valor.trim() !== "")
    .map((e) => `${e.grupo}: ${e.valor}`)
    .join("\n");

  const valores: Record<(typeof MARCADORES)[number], string> = {
    produto: dados.produto,
    codigo: dados.codigo,
    opcoes,
    quantidade: String(dados.quantidade),
    link: dados.link,
  };

  // Um marcador vazio precisa levar a linha dele junto. Sem isso, um produto
  // sem opções manda uma linha em branco sobrando no meio da mensagem — e não
  // dá para resolver depois colapsando linhas vazias, porque a linha em branco
  // proposital (a de respiro depois da saudação) é indistinguível dela.
  let texto = template;
  for (const marcador of MARCADORES) {
    if (valores[marcador] !== "") continue;
    texto = texto.replace(new RegExp(`^[ \\t]*\\{${marcador}\\}[ \\t]*\\n?`, "gm"), "");
  }

  return texto
    .replace(
      /\{(produto|codigo|opcoes|quantidade|link)\}/g,
      (_, chave: (typeof MARCADORES)[number]) => valores[chave]
    )
    .trim();
}

/**
 * Link do WhatsApp. `numero` são só dígitos com país e DDD (5524992087591);
 * `wa.me` rejeita qualquer outra coisa.
 */
export function montarLinkWhatsApp(numero: string, mensagem: string): string {
  const digitos = numero.replace(/\D/g, "");
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensagem)}`;
}
