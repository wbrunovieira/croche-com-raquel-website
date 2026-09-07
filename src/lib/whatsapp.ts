/**
 * Montagem da mensagem de WhatsApp.
 *
 * Este é o ponto de conversão do site inteiro: é o que a cliente envia e o que
 * a Raquel recebe. Uma coisa não pode faltar na mensagem — QUAL peça, com o
 * link da página — porque sem isso a Raquel precisa perguntar de novo, que é
 * exatamente o atrito que o site existe para remover. Cor, tamanho e acabamento
 * ela esclarece no atendimento: o site é vitrine, não formulário de pedido.
 *
 * Função pura, sem acesso a banco: roda igual no servidor e no navegador.
 */

export type DadosDaMensagem = {
  produto: string;
  /** Identificador curto da peça, derivado do slug: BOLSA-SERRA. */
  codigo: string;
  quantidade: number;
  /** URL absoluta da página do produto. */
  link: string;
};

/**
 * Marcadores aceitos no template gravado no banco.
 *
 * `{opcoes}` continua na lista de propósito, e sempre vazio: os templates já
 * gravados escrevem esse marcador, e tirá-lo daqui faria o texto literal
 * "{opcoes}" chegar no WhatsApp da cliente. Vazio, ele leva a própria linha
 * embora (ver abaixo) e a mensagem sai limpa.
 */
const MARCADORES = ["produto", "codigo", "opcoes", "quantidade", "link"] as const;

export function codigoDoProduto(slug: string): string {
  return slug.toUpperCase();
}

export function montarMensagem(template: string, dados: DadosDaMensagem): string {
  const valores: Record<(typeof MARCADORES)[number], string> = {
    produto: dados.produto,
    codigo: dados.codigo,
    opcoes: "",
    quantidade: String(dados.quantidade),
    link: dados.link,
  };

  // Um marcador vazio precisa levar a linha dele junto. Sem isso, o template
  // manda uma linha em branco sobrando no meio da mensagem — e não dá para
  // resolver depois colapsando linhas vazias, porque a linha em branco
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

export type BriefingDeEncomenda = {
  tipoDePeca: string;
  cores: string;
  medidas: string;
  prazo: string;
  detalhes: string;
};

const ROTULOS: { chave: keyof BriefingDeEncomenda; rotulo: string }[] = [
  { chave: "tipoDePeca", rotulo: "Peça" },
  { chave: "cores", rotulo: "Cores" },
  { chave: "medidas", rotulo: "Medidas" },
  { chave: "prazo", rotulo: "Para quando" },
  { chave: "detalhes", rotulo: "Detalhes" },
];

/**
 * Mensagem da encomenda sob medida.
 *
 * Só entra no texto o campo que a pessoa preencheu: um briefing cheio de
 * "Medidas: (não informado)" é pior que um briefing curto, porque dá à Raquel
 * a impressão de que a pessoa respondeu quando ela não respondeu.
 */
export function montarMensagemDeEncomenda(b: BriefingDeEncomenda): string {
  const linhas = ROTULOS.map(({ chave, rotulo }) => {
    const valor = b[chave].trim();
    return valor === "" ? null : `${rotulo}: ${valor}`;
  }).filter((l): l is string => l !== null);

  return [
    "Oi Raquel! Queria encomendar uma peça sob medida 💛",
    "",
    ...linhas,
  ]
    .join("\n")
    .trim();
}
