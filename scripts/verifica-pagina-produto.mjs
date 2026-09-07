/**
 * Verificação ponta a ponta do caminho de conversão — a funcionalidade central
 * do site. Abre a página de produto num navegador de verdade e confere o link
 * do WhatsApp que sai dali.
 *
 * O que este check protege, acima de tudo: **o botão que converte é um `<a>`
 * com `href` pronto desde o primeiro quadro**. Sem `aria-disabled`, sem
 * `<button>` esperando escolha, sem handler de clique. Já regrediu uma vez;
 * daqui não regride calado.
 *
 * Precisa do servidor de pé:  pnpm dev
 * Depois:                     pnpm check:produto
 */
import { chromium } from "playwright";

const BASE = process.env.URL_BASE ?? "http://localhost:3000";
const ROTA = "/produtos/bolsa-transversal-caramelo";

let falhas = 0;
function conferir(nome, condicao, detalhe = "") {
  if (!condicao) falhas++;
  console.log(`${condicao ? "✓" : "✗"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
}

const navegador = await chromium.launch();
try {
  const pagina = await navegador.newPage({ viewport: { width: 1280, height: 900 } });
  const resposta = await pagina.goto(BASE + ROTA, { waitUntil: "networkidle" });
  conferir("a página responde 200", resposta?.status() === 200, `status ${resposta?.status()}`);

  // O HTML servido já traz o link — nem espera de hidratação, nem estado
  // intermediário. É por isso que este locator é `a`, e não `button`.
  const link = pagina.locator('a:has-text("Pedir pelo WhatsApp")').first();
  await link.waitFor({ state: "attached", timeout: 5000 });
  const href = await link.getAttribute("href");
  conferir("o botão nasce como link, com href", Boolean(href), href ?? "sem href");
  conferir(
    "e não finge estar desabilitado",
    (await link.getAttribute("aria-disabled")) === null
  );
  conferir(
    "nenhum botão de pedido esperando escolha",
    (await pagina.locator('button:has-text("Pedir pelo WhatsApp")').count()) === 0
  );
  conferir(
    "a página não oferece mais seletor de opção",
    (await pagina.getByRole("radio").count()) === 0
  );

  const url = new URL(href ?? "");
  const texto = url.searchParams.get("text") ?? "";

  conferir("o link vai para o wa.me", url.host === "wa.me", url.host);
  conferir(
    "com o número da Raquel, só dígitos",
    /^\d{12,13}$/.test(url.pathname.slice(1)),
    url.pathname.slice(1)
  );
  conferir("a mensagem nomeia a peça", texto.includes("Bolsa Transversal Caramelo"));
  conferir("leva a quantidade", texto.includes("Quantidade: 1"));
  conferir("e o link da página, para a Raquel saber qual peça é", texto.includes(ROTA));
  conferir("sem marcador cru sobrando no texto", !/\{[a-z]+\}/.test(texto));

  // A quantidade é a única escolha que sobrou, e ela precisa chegar na
  // mensagem — é o que muda o orçamento.
  await pagina.getByLabel("Aumentar quantidade").first().click();
  let textoDepois = "";
  for (let tentativa = 0; tentativa < 20; tentativa++) {
    const atual = new URL((await link.getAttribute("href")) ?? "https://wa.me/0");
    textoDepois = atual.searchParams.get("text") ?? "";
    if (textoDepois.includes("Quantidade: 2")) break;
    await pagina.waitForTimeout(100);
  }
  conferir("mudar a quantidade muda a mensagem", textoDepois.includes("Quantidade: 2"));

  console.log("\n--- mensagem que chega no WhatsApp ---");
  console.log(textoDepois);
  console.log("--------------------------------------");
} finally {
  await navegador.close();
}

console.log(falhas === 0 ? "\n✓ caminho de conversão ok" : `\n✗ ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
