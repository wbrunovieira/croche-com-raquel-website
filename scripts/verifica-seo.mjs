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
  ok("robots.txt bloqueia o painel", robots.includes("Disallow: /admin"));
  ok("e aponta o sitemap", robots.includes("/sitemap.xml"));

  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  ok("sitemap tem as páginas", urls.length >= 20, `${urls.length} urls`);
  ok("e não expõe o painel", !urls.some((u) => u.includes("/admin")));
  ok("nem rascunhos", !urls.some((u) => u.includes("rascunho")));

  // página de produto
  await p.goto(`${BASE}/produtos/bolsa-serra`, { waitUntil: "networkidle" });
  const dados = await jsonLd(p);
  const produto = dados.find((d) => d["@type"] === "Product");
  ok("produto tem JSON-LD Product", Boolean(produto));
  ok("com oferta quando há preço", produto?.offers?.price === "320.00", produto?.offers?.price);
  ok(
    "e disponibilidade de peça sob encomenda",
    produto?.offers?.availability === "https://schema.org/MadeToOrder"
  );
  ok("tem trilha estruturada", dados.some((d) => d["@type"] === "BreadcrumbList"));
  ok("tem o negócio local", dados.some((d) => d["@type"] === "LocalBusiness"));

  const canonica = await p.getAttribute('link[rel="canonical"]', "href");
  ok("tem canônica", canonica?.endsWith("/produtos/bolsa-serra") ?? false, canonica ?? "");
  const ogProduto = await p.getAttribute('meta[property="og:image"]', "content");
  ok("tem imagem de compartilhamento", Boolean(ogProduto));
  if (ogProduto) {
    const r = await fetch(ogProduto);
    ok("e ela responde como imagem", r.headers.get("content-type") === "image/png");
  }

  // peça sem preço não inventa oferta
  await p.goto(`${BASE}/produtos/bolsa-cristal`, { waitUntil: "networkidle" });
  const semPreco = (await jsonLd(p)).find((d) => d["@type"] === "Product");
  ok("peça sob consulta não declara oferta", semPreco?.offers === undefined);

  // FAQ
  await p.goto(`${BASE}/perguntas-frequentes`, { waitUntil: "networkidle" });
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
  // O Next resolve "/" contra a metadataBase sem a barra final — a mesma forma
  // que o sitemap usa para a home.
  ok("a home tem canônica", canonicaHome === BASE, canonicaHome ?? "");

  await p.goto(`${BASE}/estilo`, { waitUntil: "domcontentloaded" });
  const robotsEstilo = await p.getAttribute('meta[name="robots"]', "content");
  ok("a amostra de estilo é noindex", robotsEstilo?.includes("noindex") ?? false, robotsEstilo ?? "");

  // toda página principal precisa de título e descrição
  for (const rota of ["/", "/bolsas", "/catalogo", "/sobre", "/contato", "/encomendas"]) {
    await p.goto(BASE + rota, { waitUntil: "domcontentloaded" });
    const titulo = await p.title();
    const desc = await p.getAttribute('meta[name="description"]', "content");
    ok(`${rota} tem título e descrição`, titulo.length > 10 && (desc?.length ?? 0) > 40);
  }
} finally {
  await b.close();
}

console.log(falhas === 0 ? "\n✓ SEO ok" : `\n✗ ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
