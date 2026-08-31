/**
 * Verificação ponta a ponta do caminho de conversão — a funcionalidade central
 * do site. Abre a página de produto num navegador de verdade, escolhe as
 * opções e confere o link do WhatsApp que sai dali.
 *
 * Precisa do servidor de pé:  pnpm dev
 * Depois:                     pnpm check:produto
 */
import { chromium } from "playwright";

const BASE = process.env.URL_BASE ?? "http://localhost:3000";
// A transversal caramelo é a peça que exercita mais mecânica de uma vez:
// três grupos de escolha única e um de texto livre.
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

  const botao = pagina.locator('button:has-text("Pedir pelo WhatsApp")').first();
  conferir(
    "o botão começa desabilitado, com escolha obrigatória pendente",
    await botao.isDisabled()
  );
  const aviso = (await pagina.locator('[role="status"]').first().textContent())?.trim();
  conferir("e diz o que falta escolher", /^Falta escolher:/.test(aviso ?? ""), aviso);

  await pagina.getByRole("radio", { name: "Terracota" }).click();
  await pagina.getByRole("radio", { name: "De couro" }).click();
  await pagina.getByRole("radio", { name: "Sem forro" }).click();
  await pagina.getByPlaceholder("Nome ou monograma").fill("Raquel");
  await pagina.getByLabel("Aumentar quantidade").first().click();

  const link = pagina.locator('a:has-text("Pedir pelo WhatsApp")').first();
  await link.waitFor({ state: "attached", timeout: 5000 });
  const href = await link.getAttribute("href");
  const url = new URL(href ?? "");
  const texto = url.searchParams.get("text") ?? "";

  conferir("o link vai para o wa.me", url.host === "wa.me", url.host);
  conferir(
    "com o número da Raquel, só dígitos",
    /^\d{12,13}$/.test(url.pathname.slice(1)),
    url.pathname.slice(1)
  );
  conferir("a mensagem nomeia a peça", texto.includes("Bolsa Transversal Caramelo"));
  conferir("carrega todas as escolhas", 
    ["Cor: Terracota", "Alça: De couro", "Forro: Sem forro", "Personalização: Raquel"]
      .every((t) => texto.includes(t))
  );
  conferir("leva a quantidade", texto.includes("Quantidade: 2"));
  conferir("e o link da página, para a Raquel saber qual peça é", texto.includes(ROTA));

  console.log("\n--- mensagem que chega no WhatsApp ---");
  console.log(texto);
  console.log("--------------------------------------");
} finally {
  await navegador.close();
}

console.log(falhas === 0 ? "\n✓ caminho de conversão ok" : `\n✗ ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
