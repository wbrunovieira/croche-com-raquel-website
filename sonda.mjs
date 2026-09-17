import { chromium } from "playwright";
const U = process.env.URL_BASE ?? "https://preview.crochecomraquel.com.br";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await p.addInitScript(() => {
  window.__lcp = null;
  new PerformanceObserver((l) => {
    const e = l.getEntries().at(-1);
    window.__lcp = { tempo: Math.round(e.startTime), url: e.url || "(texto)", tag: e.element?.tagName || "", classe: (e.element?.className || "").slice(0, 50) };
  }).observe({ type: "largest-contentful-paint", buffered: true });
});
await p.goto(U, { waitUntil: "networkidle", timeout: 90000 });
const r = await p.evaluate(() => ({
  lcp: window.__lcp,
  fontes: performance.getEntriesByType("resource").filter((e) => /\.(woff2?|ttf)/.test(e.name)).map((e) => ({ ms: Math.round(e.duration), url: e.name.slice(-40) })),
  pior: performance.getEntriesByType("resource").sort((a,b)=>b.duration-a.duration).slice(0,3).map((e)=>({ms:Math.round(e.duration),tipo:e.initiatorType,url:e.name.slice(-55)})),
}));
console.log(`LCP ${r.lcp.tempo}ms · <${r.lcp.tag}> · ${r.lcp.url.slice(-60)}`);
console.log("fontes:", r.fontes.map(f=>`${f.ms}ms`).join(", ") || "(nenhuma)");
r.pior.forEach((e)=>console.log(`  pior: ${e.ms}ms ${e.tipo} …${e.url}`));
await b.close();
