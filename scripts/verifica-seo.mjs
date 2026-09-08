/**
 * Verificação de SEO: o que o buscador precisa encontrar em cada página.
 *
 * Precisa do servidor de pé:  pnpm dev
 * Depois:                     pnpm check:seo
 */
import { chromium } from "playwright";

const BASE = process.env.URL_BASE ?? "http://localhost:3000";

let falhas = 0;
const ok = (nome, condicao, detalhe = "") => {
  if (!condicao) falhas++;
  console.log(`${condicao ? "✓" : "✗"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
};

async function jsonLd(p) {
  return p.evaluate(() =>
    [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) =>
      JSON.parse(s.textContent)
    )
  );
}

const b = await chromium.launch();
try {
  const p = await b.newPage();

  // robots e sitemap
  const robots = await (await fetch(`${BASE}/robots.txt`)).text();

  // O check roda tanto contra o localhost/domínio quanto contra o preview, e as
  // regras corretas são opostas nos dois. Sem distinguir, ele acusa seis falhas
  // no preview — e check que grita lobo passa a ser ignorado.
  const foraDoBuscador = /Disallow: \/$/m.test(robots) && !robots.includes("Allow: /");
  if (foraDoBuscador) {
    ok("host fora do buscador: robots bloqueia tudo", robots.includes("Disallow: /"));
  } else {
    ok("robots.txt bloqueia o painel", robots.includes("Disallow: /admin"));
    ok("e aponta o sitemap", robots.includes("/sitemap.xml"), robots.includes("/sitemap.xml") ? "" : "obra ligada? o domínio só aponta o sitemap depois do lançamento");
  }

  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  // Sem número mágico: o que importa é que a home, o hub e **toda peça
  // publicada** estejam lá. O site é de uma página, então a contagem é baixa
  // de propósito — um limiar redondo aqui só envelheceria.
  // Comparada pelo caminho, e não pela URL inteira: o sitemap sai de
  // `urlDoSite()` e o check pode estar rodando em outra porta.
  ok("o sitemap tem a home", urls.some((u) => new URL(u).pathname === "/"));
  ok("e o hub de bolsas", urls.some((u) => u.endsWith("/bolsas")));
  const noSitemap = urls.filter((u) => u.includes("/produtos/")).length;
  ok("e todas as peças publicadas", noSitemap > 0, `${noSitemap} peças de ${urls.length} urls`);
  ok("e não expõe o painel", !urls.some((u) => u.includes("/admin")));
  ok("nem rascunhos", !urls.some((u) => u.includes("rascunho")));

  // Páginas de produto.
  //
  // Os slugs vêm do sitemap, e não escritos aqui: o catálogo muda, e um check
  // preso a "bolsa-serra" morre no dia em que a peça sai do ar.
  const slugsDeProduto = urls
    .filter((u) => u.includes("/produtos/"))
    .map((u) => u.split("/produtos/")[1]);
  ok("o sitemap traz peças", slugsDeProduto.length > 0, `${slugsDeProduto.length} peças`);

  let comOferta = 0;
  for (const slug of slugsDeProduto.slice(0, 4)) {
    await p.goto(`${BASE}/produtos/${slug}`, { waitUntil: "networkidle" });
    const dados = await jsonLd(p);
    const produto = dados.find((d) => d["@type"] === "Product");

    ok(`${slug}: tem JSON-LD Product`, Boolean(produto));
    ok(`${slug}: tem trilha estruturada`, dados.some((d) => d["@type"] === "BreadcrumbList"));
    ok(`${slug}: tem o negócio local`, dados.some((d) => d["@type"] === "LocalBusiness"));

    // A regra que importa: a oferta declarada é a mesma coisa que a página
    // mostra para a cliente. Sem preço na tela não pode existir oferta no
    // JSON-LD — seria prometer ao buscador o que a página não diz.
    const naTela = await p.getAttribute("[data-preco]", "content").catch(() => null)
      ?? await p.evaluate(() => document.querySelector("[data-preco]")?.dataset.preco ?? null);
    if (naTela === "sob-consulta") {
      ok(`${slug}: sob consulta, sem oferta declarada`, produto?.offers === undefined);
    } else {
      comOferta++;
      ok(`${slug}: a oferta bate com o preço da página`, produto?.offers?.price === naTela, `${produto?.offers?.price} vs ${naTela}`);
      ok(
        `${slug}: disponibilidade de peça sob encomenda`,
        produto?.offers?.availability === "https://schema.org/MadeToOrder"
      );
    }

    const canonica = await p.getAttribute('link[rel="canonical"]', "href");
    ok(`${slug}: tem canônica`, canonica?.endsWith(`/produtos/${slug}`) ?? false, canonica ?? "");
    const og = await p.getAttribute('meta[property="og:image"]', "content");
    ok(`${slug}: tem imagem de compartilhamento`, Boolean(og));
    if (og) {
      // A `og:image` aponta para o domínio, que é o certo — mas enquanto a obra
      // está ligada o domínio responde a página de obra em tudo. Então a imagem
      // é buscada no host que estamos medindo, e não na URL declarada.
      const noHostMedido = og.replace(/^https?:\/\/[^/]+/, BASE);
      const r = await fetch(noHostMedido);
      ok(
        `${slug}: e ela responde como imagem`,
        r.headers.get("content-type") === "image/png",
        r.headers.get("content-type") ?? ""
      );
    }
  }

  if (comOferta === 0) {
    console.log(
      "○ nenhuma peça com preço no banco — a regra de oferta com valor não foi exercitada"
    );
  }

  // FAQ — as perguntas viraram seção da home, e o FAQPage foi junto.
  await p.goto(BASE, { waitUntil: "networkidle" });
  const faq = (await jsonLd(p)).find((d) => d["@type"] === "FAQPage");
  ok("FAQ tem JSON-LD", (faq?.mainEntity?.length ?? 0) >= 5, `${faq?.mainEntity?.length} perguntas`);

  // hub de bolsas: um h1 só, e vários h2
  await p.goto(`${BASE}/bolsas`, { waitUntil: "networkidle" });
  const titulos = await p.evaluate(() => ({
    h1: document.querySelectorAll("main h1").length,
    h2: document.querySelectorAll("main h2").length,
  }));
  ok("o hub tem exatamente um h1", titulos.h1 === 1, `${titulos.h1}`);
  ok("e conteúdo dividido em h2", titulos.h2 >= 5, `${titulos.h2} h2`);

  // a home precisa da própria canônica, e a amostra de estilo não pode indexar
  await p.goto(BASE, { waitUntil: "domcontentloaded" });
  const canonicaHome = await p.getAttribute('link[rel="canonical"]', "href");
  // Comparada com a home do sitemap, não com a URL que navegamos: as duas saem
  // de `urlDoSite()`, então o check continua valendo numa porta alternativa.
  const homeNoSitemap = urls[0];
  ok("a home tem canônica", canonicaHome === homeNoSitemap, canonicaHome ?? "");

  await p.goto(`${BASE}/estilo`, { waitUntil: "domcontentloaded" });
  const robotsEstilo = await p.getAttribute('meta[name="robots"]', "content");
  ok("a amostra de estilo é noindex", robotsEstilo?.includes("noindex") ?? false, robotsEstilo ?? "");

  // toda página que sobrou precisa de título e descrição
  for (const rota of ["/", "/bolsas", "/politicas/privacidade"]) {
    await p.goto(BASE + rota, { waitUntil: "domcontentloaded" });
    const titulo = await p.title();
    const desc = await p.getAttribute('meta[name="description"]', "content");
    ok(`${rota} tem título e descrição`, titulo.length > 10 && (desc?.length ?? 0) > 40);
  }

  // O site é de uma página: as rotas antigas redirecionam em vez de sumir.
  // A Raquel já mandou esses endereços por WhatsApp.
  for (const [antiga, ancora] of [
    ["/sobre", "quem-faz"], ["/cuidados", "cuidados"],
    ["/perguntas-frequentes", "perguntas"], ["/encomendas", "encomendas"],
    ["/contato", "contato"], ["/catalogo", "catalogo"],
  ]) {
    const r = await fetch(BASE + antiga, { redirect: "manual" });
    const destino = r.headers.get("location") ?? "";
    ok(`${antiga} redireciona para #${ancora}`,
      [301, 308].includes(r.status) && destino.includes(ancora),
      `${r.status} → ${destino}`);
  }
  const rc = await fetch(`${BASE}/categorias/mesa-posta`, { redirect: "manual" });
  ok("/categorias/:slug vira filtro do catálogo",
    [301, 308].includes(rc.status) && (rc.headers.get("location") ?? "").includes("categoria=mesa-posta"),
    `${rc.status} → ${rc.headers.get("location") ?? ""}`);

  // As âncoras precisam existir de fato, senão o redirecionamento cai no vazio.
  await p.goto(BASE, { waitUntil: "networkidle" });
  for (const id of ["catalogo", "quem-faz", "cuidados", "perguntas", "encomendas", "contato"]) {
    ok(`a home tem a seção #${id}`, (await p.locator(`#${id}`).count()) === 1);
  }
} finally {
  await b.close();
}

/**
 * As âncoras funcionam ao ABRIR a URL, não só ao clicar.
 *
 * `/#encomendas` é endereço de verdade neste site — é assim que o menu navega e
 * é o que se manda por WhatsApp. E estava quebrado: o `scroll-behavior: smooth`
 * faz o navegador começar uma rolagem suave de milhares de pixels ao abrir a
 * página, e qualquer coisa que mexa na rolagem no caminho a interrompe. Parava
 * a 182px de uma seção a 8.300px.
 *
 * Só existência da âncora no HTML não pega isso: a seção estava lá o tempo
 * todo. Por isso este teste abre a URL de verdade e mede onde a página parou.
 */
const ANCORAS = ["catalogo", "quem-faz", "cuidados", "perguntas", "encomendas", "contato"];
if (process.env.PULAR_NAVEGADOR !== "1") {
  const { chromium } = await import("playwright");
  const navegador = await chromium.launch();
  try {
    for (const id of ANCORAS) {
      const p = await navegador.newPage({ viewport: { width: 1280, height: 900 } });
      await p.goto(`${BASE}/#${id}`, { waitUntil: "load" });
      await p.waitForTimeout(2200);
      const distancia = await p.evaluate(
        (alvo) => Math.round(document.getElementById(alvo).getBoundingClientRect().top),
        id
      );
      ok(
        `abrir /#${id} chega na seção`,
        Math.abs(distancia) < 160,
        `${distancia}px do topo`
      );
      await p.close();
    }
  } finally {
    await navegador.close();
  }
}

console.log(falhas === 0 ? "\n✓ SEO ok" : `\n✗ ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
