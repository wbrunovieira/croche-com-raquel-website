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
    escolhas: [
      { grupo: "Cor", valor: "Terracota" },
      { grupo: "Alça", valor: "Transversal ajustável" },
    ],
    quantidade: 1,
    link: "https://crochecomraquel.com.br/produtos/bolsa-serra",
  }),
  "Oi Raquel! Vi no site e me interessei 💛\n\n*Bolsa Serra* (BOLSA-SERRA)\nCor: Terracota\nAlça: Transversal ajustável\nQuantidade: 1\n\nhttps://crochecomraquel.com.br/produtos/bolsa-serra"
);

conferir(
  "sem escolhas, nao deixa linha em branco sobrando",
  montarMensagem(TEMPLATE, {
    produto: "Manta Petrópolis",
    codigo: "MANTA-PETROPOLIS",
    escolhas: [],
    quantidade: 2,
    link: "https://exemplo.com/p/manta",
  }),
  "Oi Raquel! Vi no site e me interessei 💛\n\n*Manta Petrópolis* (MANTA-PETROPOLIS)\nQuantidade: 2\n\nhttps://exemplo.com/p/manta"
);

conferir(
  "ignora personalizacao deixada em branco",
  montarMensagem("{produto}\n{opcoes}", {
    produto: "Necessaire",
    codigo: "N",
    escolhas: [
      { grupo: "Cor", valor: "Cru" },
      { grupo: "Personalização", valor: "   " },
    ],
    quantidade: 1,
    link: "",
  }),
  "Necessaire\nCor: Cru"
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
  "encomenda: só entra o que foi preenchido",
  montarMensagemDeEncomenda({
    tipoDePeca: "Bolsa transversal",
    cores: "Terracota",
    medidas: "",
    prazo: "Até o Natal",
    detalhes: "   ",
  }),
  "Oi Raquel! Queria encomendar uma peça sob medida 💛\n\nPeça: Bolsa transversal\nCores: Terracota\nPara quando: Até o Natal"
);

console.log(falhas === 0 ? "\n✓ mensagem de WhatsApp ok" : `\n✗ ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
