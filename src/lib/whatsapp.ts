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
 * Só os dígitos do número — é o que o `wa.me` aceita, e ele rejeita o resto.
 *
 * **Existe porque o número vem do banco.** O painel deixou de editar as
 * configurações, mas nada impede que um dia edite de novo, e o dia em que
 * alguém salvar `(24) 99208-7591` é o dia em que todo link escrito à mão quebra
 * — enquanto o botão de pedido, que já passava por aqui, segue funcionando. Era
 * exatamente essa assimetria: nove links interpolavam `wa.me/${numero}` direto e
 * um só limpava.
 */
export function somenteDigitos(numero: string): string {
  return numero.replace(/\D/g, "");
}

/** Link do WhatsApp sem mensagem — para o "falar com a Raquel" de cabeçalho, rodapé e afins. */
export function linkDoWhatsapp(numero: string): string {
  return `https://wa.me/${somenteDigitos(numero)}`;
}

/** Link do WhatsApp com mensagem pronta. */
export function montarLinkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${somenteDigitos(numero)}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Mensagem da encomenda sob medida.
 *
 * O briefing virou **um texto livre**. Antes eram cinco campos rotulados
 * (peça, cores, medidas, prazo, detalhes) e a mensagem saía como uma ficha
 * — "Peça: … / Cores: …". Cada pergunta era razoável e o conjunto virava
 * formulário: quem chega com vontade de encomendar bate numa lista e adia.
 *
 * Sem rótulos para montar, a função ficou simples de propósito. O que ela
 * ainda garante é o que importa: a mensagem **nunca sai vazia**. Mesmo sem
 * uma palavra digitada, a Raquel recebe uma saudação que diz do que se trata,
 * e a conversa começa.
 */
export function montarMensagemDeEncomenda(pedido: string): string {
  const texto = pedido.trim();
  const abertura = "Oi Raquel! Queria encomendar uma peça sob medida 💛";
  return texto === "" ? abertura : `${abertura}\n\n${texto}`;
}

/**
 * O `@arroba` derivado da URL do Instagram.
 *
 * **O rótulo estava escrito em código em três telas** (`@croche.comraquel`),
 * enquanto o link vinha do banco (`config.instagramUrl`). Se ela trocar de
 * perfil no painel, o link vai para um lugar e o texto diz outro — e o texto é o
 * que a pessoa lê antes de clicar.
 *
 * Mora aqui por proximidade: é o mesmo tipo de derivação que
 * `somenteDigitos` faz com o telefone. Devolve `null` quando não dá para
 * derivar, para a tela poder decidir o que mostrar.
 */
export function arrobaDoInstagram(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const caminho = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
    return caminho ? `@${caminho.split("/")[0]}` : null;
  } catch {
    return null;
  }
}
