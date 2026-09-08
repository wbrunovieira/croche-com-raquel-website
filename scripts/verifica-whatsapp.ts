/**
 * Confere a montagem da mensagem de WhatsApp nos casos que importam.
 * Roda com `pnpm check:whatsapp`. Sem banco: a função é pura.
 */
import {
  codigoDoProduto,
  montarLinkWhatsApp,
  montarMensagem,
  montarMensagemDeEncomenda,
} from "../src/lib/whatsapp";

const TEMPLATE =
  "Oi Raquel! Vi no site e me interessei 💛\n\n*{produto}* ({codigo})\n{opcoes}\nQuantidade: {quantidade}\n\n{link}";

let falhas = 0;
function conferir(nome: string, real: string, esperado: string) {
  const ok = real === esperado;
  if (!ok) falhas++;
  console.log(`${ok ? "✓" : "✗"} ${nome}`);
  if (!ok) {
    console.log("  esperado:", JSON.stringify(esperado));
    console.log("  obtido  :", JSON.stringify(real));
  }
}

conferir(
  "monta a mensagem completa",
  montarMensagem(TEMPLATE, {
    produto: "Bolsa Serra",
    codigo: codigoDoProduto("bolsa-serra"),
    quantidade: 1,
    link: "https://crochecomraquel.com.br/produtos/bolsa-serra",
  }),
  "Oi Raquel! Vi no site e me interessei 💛\n\n*Bolsa Serra* (BOLSA-SERRA)\nQuantidade: 1\n\nhttps://crochecomraquel.com.br/produtos/bolsa-serra"
);

// O template gravado no banco ainda tem `{opcoes}` — os grupos de opção saíram
// do site, o texto já salvo não. O marcador precisa levar a própria linha
// embora; se ele vazasse, a cliente mandaria "{opcoes}" para a Raquel.
conferir(
  "o marcador de opcoes some com a linha dele",
  montarMensagem(TEMPLATE, {
    produto: "Manta Petrópolis",
    codigo: "MANTA-PETROPOLIS",
    quantidade: 2,
    link: "https://exemplo.com/p/manta",
  }),
  "Oi Raquel! Vi no site e me interessei 💛\n\n*Manta Petrópolis* (MANTA-PETROPOLIS)\nQuantidade: 2\n\nhttps://exemplo.com/p/manta"
);

conferir(
  "e nao sobra nenhum marcador cru no texto",
  /\{[a-z]+\}/.test(
    montarMensagem(TEMPLATE, {
      produto: "Necessaire",
      codigo: "N",
      quantidade: 1,
      link: "https://exemplo.com/p/necessaire",
    })
  )
    ? "sobrou marcador"
    : "limpo",
  "limpo"
);

const link = montarLinkWhatsApp("+55 (24) 99208-7591", "Oi Raquel! 💛 & tal");
conferir(
  "limpa o numero e escapa o texto",
  link,
  "https://wa.me/5524992087591?text=Oi%20Raquel!%20%F0%9F%92%9B%20%26%20tal"
);
conferir(
  "o texto escapado volta ao original",
  decodeURIComponent(new URL(link).searchParams.get("text") ?? ""),
  "Oi Raquel! 💛 & tal"
);

conferir(
  "encomenda: o que ela escreveu vai junto",
  montarMensagemDeEncomenda(
    "  Uma bolsa transversal em terracota, para o Natal.  "
  ),
  "Oi Raquel! Queria encomendar uma peça sob medida 💛\n\nUma bolsa transversal em terracota, para o Natal."
);

/**
 * A mensagem NUNCA sai vazia.
 *
 * O briefing virou um campo só e nada é obrigatório: quem só quer perguntar
 * clica direto. Se a saudação sumisse com o campo em branco, a Raquel receberia
 * um WhatsApp mudo e não saberia do que se trata — que é justamente o oposto do
 * que este bloco existe para fazer.
 */
conferir(
  "encomenda: sem escrever nada, a saudação ainda vai",
  montarMensagemDeEncomenda("   "),
  "Oi Raquel! Queria encomendar uma peça sob medida 💛"
);

console.log(falhas === 0 ? "\n✓ mensagem de WhatsApp ok" : `\n✗ ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
