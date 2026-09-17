import { chromium } from "playwright";
const U = process.env.URL_BASE ?? "https://preview.crochecomraquel.com.br";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await p.addInitScript(() => {
  window.__lcps = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries())
      window.__lcps.push({ t: Math.round(e.startTime), tag: e.element?.tagName, url: (e.url||"").slice(-45), area: Math.round((e.size||0)/1000) });
  }).observe({ type: "largest-contentful-paint", buffered: true });
  window.__paints = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__paints.push({ nome: e.name, t: Math.round(e.startTime) });
  }).observe({ type: "paint", buffered: true });
});
await p.goto(U, { waitUntil: "networkidle", timeout: 90000 });
const r = await p.evaluate(() => {
  const nav = performance.getEntriesByType("navigation")[0];
  const bloqueantes = performance.getEntriesByType("resource")
    .filter((e) => e.renderBlockingStatus === "blocking" || /\.css$/.test(e.name))
    .map((e) => ({ ms: Math.round(e.duration), fim: Math.round(e.responseEnd), url: e.name.slice(-45) }));
  return { paints: window.__paints, lcps: window.__lcps, bloqueantes,
    resposta: Math.round(nav.responseEnd), domInterativo: Math.round(nav.domInteractive), domPronto: Math.round(nav.domContentLoadedEventEnd) };
});
console.log(`  HTML pronto: ${r.resposta}ms · DOM interativo: ${r.domInterativo}ms · DOMContentLoaded: ${r.domPronto}ms`);
r.paints.forEach((x) => console.log(`  ${x.nome}: ${x.t}ms`));
console.log("  entradas de LCP:");
r.lcps.forEach((x) => console.log(`    ${String(x.t).padStart(5)}ms  <${x.tag}>  área ${x.area}k  ${x.url}`));
console.log("  bloqueantes de render:");
r.bloqueantes.forEach((x) => console.log(`    termina em ${x.fim}ms (${x.ms}ms)  …${x.url}`));
await b.close();
