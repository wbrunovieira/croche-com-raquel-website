/**
 * Verificação de estabilidade visual e carregamento.
 *
 * **Por que ela existe.** A home estava com **CLS 0,92** no ar — nove vezes o
 * limite do Google, que é 0,1. A causa não aparecia em build, lint, tipo nem em
 * nenhuma das outras verificações: o cabeçalho animava `height` e o logotipo
 * animava `font-size` na montagem, e as duas são propriedades de LAYOUT. Como o
 * cabeçalho é fixo no topo, cada quadro dessas animações empurrava a página
 * inteira — dezenove deslocamentos em 150 milissegundos.
 *
 * Nada disso é visível olhando a tela: a animação é rápida e parece intencional.
 * Só a medição pega.
 *
 * Precisa do servidor de pé:  pnpm dev
 * Depois:                     pnpm check:performance
 *
 * Contra o que está no ar:
 *   URL_BASE=https://preview.crochecomraquel.com.br pnpm check:performance
 */
import { chromium } from "playwright";

const BASE = process.env.URL_BASE ?? "http://localhost:3000";

/**
 * O `pnpm dev` compila sob demanda e serve sem otimização: a home mediu 2920ms
 * de LCP local contra **636ms** no que está no ar. Cobrar o limite aqui seria
 * acusar falso todo dia — e verificação que acusa falso é verificação que as
 * pessoas aprendem a ignorar.
 *
 * O CLS, esse vale nos dois: ele é consequência do que o código faz com o
 * layout, não da velocidade de quem serve. Foi medindo local que a correção do
 * cabeçalho se provou, e é contra produção que o defeito apareceu.
 */
const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(BASE);

/** Os limites do Google para "bom". Não são meta: são o mínimo. */
const LIMITE_CLS = 0.1;
const LIMITE_LCP_MS = 2500;

const PAGINAS = [
  { caminho: "/", nome: "home" },
  { caminho: "/bolsas", nome: "hub de bolsas" },
  { caminho: "/produtos/bolsa-saco-cafe", nome: "página de peça" },
];

let falhas = 0;
const ok = (nome, condicao, detalhe = "") => {
  console.log(`${condicao ? "✓" : "✗"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!condicao) falhas++;
};

const navegador = await chromium.launch();

try {
  for (const { caminho, nome } of PAGINAS) {
    const pagina = await navegador.newPage({ viewport: { width: 1350, height: 940 } });

    // O observador precisa existir ANTES da primeira pintura: deslocamento que
    // acontece durante a hidratação é justamente o que se quer pegar.
    await pagina.addInitScript(() => {
      window.__cls = 0;
      window.__lcp = 0;
      new PerformanceObserver((lista) => {
        for (const e of lista.getEntries()) {
          // `hadRecentInput` marca o que a pessoa causou rolando ou clicando —
          // isso não conta, e é o que permite o cabeçalho encolher na rolagem
          // sem penalidade.
          if (!e.hadRecentInput) window.__cls += e.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((lista) => {
        for (const e of lista.getEntries()) window.__lcp = e.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });

    await pagina.goto(BASE + caminho, { waitUntil: "networkidle" });
    // Três segundos e meio: as animações de entrada e o rodízio da foto do hero
    // já rodaram, e é onde os deslocamentos tardios apareciam.
    await pagina.waitForTimeout(3500);

    const { cls, lcp } = await pagina.evaluate(() => ({
      cls: window.__cls,
      lcp: Math.round(window.__lcp),
    }));

    ok(`${nome}: layout estável`, cls <= LIMITE_CLS, `CLS ${cls.toFixed(4)} (limite ${LIMITE_CLS})`);
    if (LOCAL) {
      console.log(`· ${nome}: LCP ${lcp}ms — não cobrado no \`pnpm dev\`, ver o comentário do módulo`);
    } else {
      ok(
        `${nome}: pinta o principal a tempo`,
        lcp <= LIMITE_LCP_MS,
        `LCP ${lcp}ms (limite ${LIMITE_LCP_MS})`
      );
    }

    await pagina.close();
  }
  /**
   * **As fotos das peças chegam redimensionadas?**
   *
   * Esta é a asserção que faltava em 17/09/2026. A rota `/fotos` era
   * `force-static`, o que a torna ISR — e o otimizador de imagem da Vercel **não
   * otimiza imagem cuja origem é rota ISR do próprio deploy**: devolvia o arquivo
   * original, do tamanho que estivesse, em qualquer largura pedida. O mesmo
   * código otimizava perfeitamente no build local, então **nada acusava fora do
   * ar** — nem build, nem lint, nem o CLS e o LCP aqui em cima, porque as fotos
   * de hoje são recortes de 640×800 e cabem no orçamento.
   *
   * O estrago só apareceria quando ela subisse foto de verdade: o painel guarda
   * até 2000px de lado, e cada card da home baixaria o arquivo inteiro no 4G.
   *
   * A medição é direta: pedir a MENOR largura que o site usa e conferir que o que
   * volta é bem menor que o original. Passar direto devolve exatamente o mesmo
   * número de bytes, então a margem separa os dois casos sem ambiguidade.
   */
  const LARGURA_MINIATURA = 64;
  /** Passando direto, a razão é 1,00. Redimensionando de verdade, fica abaixo de 0,1. */
  const RAZAO_MAXIMA = 0.5;

  {
    const pagina = await navegador.newPage();
    await pagina.goto(`${BASE}/`, { waitUntil: "networkidle" });
    // A primeira foto de peça da home — pega o caminho como o site realmente o
    // escreve, em vez de montar um endereço na mão que pode envelhecer.
    const caminho = await pagina.evaluate(() => {
      const img = [...document.querySelectorAll("img")]
        .map((i) => i.currentSrc || i.src)
        .find((u) => /%2Ffotos%2F|\/fotos\//.test(u));
      if (!img) return null;
      const url = new URL(img, location.href);
      return url.searchParams.get("url") ?? url.pathname;
    });
    await pagina.close();

    if (!caminho) {
      // Endereço que serve a obra não tem peça nenhuma — é o caso do domínio
      // raiz antes do lançamento, e de qualquer URL de deploy cru. Acusar ali
      // seria apontar defeito onde só há configuração; ensinar a ignorar
      // alarme custa mais caro que a asserção vale.
      const ehObra = /— em breve/.test(await (await fetch(`${BASE}/`)).text());
      if (ehObra) {
        console.log(`○ ${BASE} está servindo a obra — nenhuma foto de peça para medir.`);
      } else {
        ok("achou uma foto de peça na home", false, "nenhuma imagem vinda de /fotos/");
      }
    } else {
      const original = await fetch(new URL(caminho, BASE));
      const bytesOriginal = (await original.arrayBuffer()).byteLength;

      const otimizada = await fetch(
        `${BASE}/_next/image?url=${encodeURIComponent(caminho)}&w=${LARGURA_MINIATURA}&q=75`,
        { headers: { Accept: "image/webp,image/*" } }
      );
      const bytesOtimizada = (await otimizada.arrayBuffer()).byteLength;
      const razao = bytesOtimizada / bytesOriginal;

      ok(
        `a foto chega redimensionada (w=${LARGURA_MINIATURA})`,
        razao <= RAZAO_MAXIMA,
        `${(bytesOtimizada / 1024).toFixed(1)} kB de ${(bytesOriginal / 1024).toFixed(1)} kB` +
          (razao > RAZAO_MAXIMA ? " — está passando direto pelo otimizador" : "")
      );
    }
  }
} finally {
  await navegador.close();
}

console.log(falhas === 0 ? "\n✓ performance ok" : `\n✗ ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
