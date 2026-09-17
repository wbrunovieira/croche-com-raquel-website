/**
 * Aquece as imagens depois de publicar.
 *
 * **O problema.** O cache do otimizador de imagem é por deploy: a versão
 * redimensionada de cada foto só passa a existir depois que alguém a pede. Quem
 * chega primeiro paga a geração — medido no ar, 603 ms na primeira busca de uma
 * foto contra 413 ms depois.
 *
 * **O que este script NÃO resolve.** Ele nasceu para consertar o LCP alto da
 * home logo após publicar, e não conserta: com o aquecimento rodando, o LCP
 * continuou alto, e o elemento de LCP dali **é um `<p>` de texto**, não foto.
 * O diagnóstico original estava errado. O aquecimento fica porque vale pelo que
 * de fato faz — ninguém espera imagem ser gerada —, e a investigação do LCP
 * segue aberta no board.
 *
 * **Por que um navegador, e não uma lista de endereços.** A home traz 148
 * variantes distintas de `/_next/image` — todas as larguras de todos os
 * `srcset`. Pedir as 148 aqueceria muito mais do que qualquer visitante usa, e
 * cada uma é uma transformação cobrada: foi cota estourada que tirou este site
 * do ar em setembro. Um navegador real escolhe do `srcset` só a largura do
 * próprio viewport, então visitar a página aquece **exatamente** o que um
 * visitante pediria, e nada além.
 *
 * Dois tamanhos porque o `srcset` responde ao viewport, e a maioria das
 * clientes dela chega pelo celular.
 *
 *   pnpm aquecer                       → aquece o localhost
 *   URL_BASE=https://… pnpm aquecer    → aquece o que está no ar
 */
import { chromium } from "playwright";

const BASE = (process.env.URL_BASE ?? "http://localhost:3000").replace(/\/+$/, "");

/** As telas por onde o tráfego entra. A de peça vale pelo link que ela manda no WhatsApp. */
const PAGINAS = ["/", "/bolsas"];

const TELAS = [
  { nome: "celular", viewport: { width: 390, height: 844 }, escala: 3 },
  { nome: "desktop", viewport: { width: 1440, height: 900 }, escala: 2 },
];

const navegador = await chromium.launch();
const pedidas = new Set();
let falhas = 0;
const comeco = Date.now();

try {
  /**
   * Endereço que serve a obra não tem peça para aquecer — é o caso do domínio
   * raiz antes do lançamento. Sair aqui evita gastar transformação do
   * otimizador com a página de "em breve", e deixa o mesmo comando servir para
   * os dois domínios sem ninguém ter de lembrar qual é qual.
   */
  const inicial = await (await fetch(`${BASE}/`)).text();
  if (/— em breve/.test(inicial)) {
    console.log(`○ ${BASE} está servindo a obra — nada para aquecer.`);
    await navegador.close();
    process.exit(0);
  }

  // A primeira peça do sitemap: a página de peça é o que ela manda por
  // WhatsApp, então também merece chegar pronta.
  const mapa = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const peca = (mapa.match(/produtos\/([a-z0-9-]+)</) ?? [])[1];
  if (peca) PAGINAS.push(`/produtos/${peca}`);

  for (const tela of TELAS) {
    const pagina = await navegador.newPage({
      viewport: tela.viewport,
      deviceScaleFactor: tela.escala,
    });

    pagina.on("response", (r) => {
      const url = r.url();
      if (!url.includes("/_next/image")) return;
      if (r.status() >= 400) {
        falhas++;
        console.log(`  ✗ ${r.status()} ${url.slice(BASE.length, BASE.length + 90)}`);
        return;
      }
      pedidas.add(url);
    });

    for (const caminho of PAGINAS) {
      await pagina.goto(`${BASE}${caminho}`, { waitUntil: "networkidle", timeout: 60000 });
      /**
       * Rolar até o fim importa: o `next/image` só busca o que entra na tela, e
       * o catálogo da home fica bem abaixo da dobra. Sem isto, aquece o hero e
       * deixa fria a grade que a pessoa vê três segundos depois.
       */
      await pagina.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
          window.scrollTo(0, y);
          await new Promise((seguir) => setTimeout(seguir, 120));
        }
      });
      await pagina.waitForLoadState("networkidle").catch(() => {});
    }

    await pagina.close();
    console.log(`  ${tela.nome}: ${pedidas.size} imagem(ns) aquecida(s) até aqui`);
  }
} finally {
  await navegador.close();
}

const segundos = ((Date.now() - comeco) / 1000).toFixed(1);
console.log(
  falhas === 0
    ? `\n✓ ${pedidas.size} imagens prontas em ${segundos}s — o próximo a chegar não espera`
    : `\n✗ ${falhas} imagem(ns) falharam (${pedidas.size} aquecidas em ${segundos}s)`
);
process.exit(falhas === 0 ? 0 : 1);
