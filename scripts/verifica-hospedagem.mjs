/**
 * Verificação do roteamento por host.
 *
 * Antes da estreia, o domínio mostra a página de obra e só o `preview.` (e o
 * localhost) veem o site completo; depois, o domínio serve o site. Esta
 * verificação **descobre em qual dos dois estados as coisas estão** e cobra o
 * conjunto certo — ver o comentário no meio do arquivo.
 *
 * Três coisas podem quebrar em silêncio e só aparecer depois do deploy: o site
 * inacabado vazar no domínio antes da hora, o preview competir com o domínio no
 * buscador, e — depois do lançamento — um `noindex` esquecido deixar o site no
 * ar e invisível no Google.
 *
 * Precisa do servidor de pé:  pnpm dev
 * Depois:                     pnpm check:hospedagem
 *
 * Contra o que já está no ar, onde esta verificação mais importa:
 *   URL_BASE=https://crochecomraquel.com.br pnpm check:hospedagem
 */
import { request as requisicaoHttp } from "node:http";
import { request as requisicaoHttps } from "node:https";

const BASE = process.env.URL_BASE ?? "http://localhost:3000";
/**
 * Contra produção o esquema é https, e mandar http rende um 301 do redirecionamento
 * em toda rota — oito falsos negativos, que foi exatamente o que aconteceu na
 * primeira vez que rodei isto contra o ar. O cliente segue o `URL_BASE`.
 */
const seguro = new URL(BASE).protocol === "https:";
const request = seguro ? requisicaoHttps : requisicaoHttp;

let falhas = 0;
const ok = (nome, condicao, detalhe = "") => {
  if (!condicao) falhas++;
  console.log(`${condicao ? "✓" : "✗"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
};

/**
 * `node:http`, e não `fetch`: o fetch do Node (undici) trata `Host` como
 * header proibido e ignora em silêncio — todo teste por host passaria a medir
 * o localhost sem avisar.
 */
function pegar(caminho, host) {
  const url = new URL(caminho, BASE);
  return new Promise((resolver, rejeitar) => {
    const req = request(
      {
        hostname: url.hostname,
        port: url.port || (seguro ? 443 : 80),
        // Contra produção o host de teste tem de viajar também no SNI e no
        // `servername`, senão o TLS fecha com o certificado do host da URL e a
        // borda roteia pelo host errado.
        ...(seguro && host ? { servername: host } : {}),
        path: url.pathname + url.search,
        method: "GET",
        headers: host ? { Host: host } : {},
      },
      (res) => {
        let corpo = "";
        res.setEncoding("utf8");
        res.on("data", (p) => (corpo += p));
        res.on("end", () =>
          resolver({ status: res.statusCode, cabecalhos: res.headers, corpo })
        );
      }
    );
    req.on("error", rejeitar);
    req.end();
  });
}

const DOMINIO = "crochecomraquel.com.br";
const PREVIEW = `preview.${DOMINIO}`;

/**
 * **A verificação descobre o estado em vez de presumir.**
 *
 * Antes do lançamento o domínio mostra a obra; depois, mostra o site. Fixar uma
 * das duas expectativas faria esta verificação reprovar no dia da estreia
 * justamente quando alguém mais precisa dela — e verificação que acusa falso é
 * verificação que se aprende a ignorar. Então ela olha o que o domínio serve e
 * cobra o conjunto certo para aquele estado. As regras que valem NOS DOIS
 * estados (painel fechado, `www` no apex, preview fora do buscador) são cobradas
 * sempre.
 */
const raiz = await pegar("/", DOMINIO);
const NO_AR = !raiz.corpo.includes("O site está sendo feito");
console.log(NO_AR ? "· o domínio serve o SITE\n" : "· o domínio serve a OBRA\n");

if (!NO_AR) {
  // A obra mostra a obra em toda rota — não só na raiz.
  for (const rota of ["/", "/bolsas", "/produtos/bolsa-saco-cafe"]) {
    const { corpo } = await pegar(rota, DOMINIO);
    ok(`${rota} no domínio cai na página de obra`, corpo.includes("O site está sendo feito"));
  }

  /**
   * A obra não pode ser indexada enquanto existir.
   *
   * O `X-Robots-Tag` de `noindex` só vale para quem NÃO é o domínio — e a obra é
   * servida justamente no domínio. Sem uma regra própria, o Google guarda
   * "Crochê com Raquel — em breve" como a descrição do site, e esse trecho
   * sobrevive semanas ao lançamento.
   */
  ok(
    "a obra sai com noindex",
    (raiz.cabecalhos["x-robots-tag"] ?? "").includes("noindex"),
    raiz.cabecalhos["x-robots-tag"] ?? "ausente"
  );
} else {
  // O domínio serve as páginas de verdade, e não sobrou obra em rota nenhuma.
  for (const rota of ["/", "/bolsas", "/produtos/bolsa-saco-cafe"]) {
    const { status, corpo } = await pegar(rota, DOMINIO);
    ok(
      `${rota} no domínio serve a página de verdade`,
      status === 200 && !corpo.includes("O site está sendo feito"),
      `status ${status}`
    );
  }

  /**
   * **Depois do lançamento, o domínio NÃO pode sair com `noindex`.**
   *
   * É o defeito mais caro possível aqui e o mais silencioso: o site fica no ar,
   * bonito, funcionando — e invisível no Google. Ninguém percebe olhando a tela;
   * percebe-se semanas depois, quando a busca pelo nome dela não traz o site.
   * Um `noindex` esquecido do tempo da obra faz exatamente isso.
   */
  ok(
    "o domínio está liberado para o buscador",
    !(raiz.cabecalhos["x-robots-tag"] ?? "").includes("noindex"),
    raiz.cabecalhos["x-robots-tag"] ?? "sem X-Robots-Tag (é o esperado)"
  );

  // E o robots.txt do domínio aponta o sitemap — é assim que o buscador acha o
  // catálogo inteiro sem depender de link.
  const robots = await pegar("/robots.txt", DOMINIO);
  ok(
    "o robots.txt do domínio aponta o sitemap",
    /Sitemap:\s*https?:\/\//i.test(robots.corpo),
    robots.corpo.split("\n").find((l) => /sitemap/i.test(l)) ?? "sem linha Sitemap"
  );
}

/**
 * **O painel nunca fica aberto, nos dois estados.**
 *
 * Antes do lançamento ele cai na obra; depois, redireciona para a tela de
 * entrada. O que não pode, em nenhum dos dois, é `/admin` responder com o painel
 * para quem não tem sessão.
 */
const admin = await pegar("/admin", DOMINIO);
const painelFechado = NO_AR
  ? [301, 302, 307, 308].includes(admin.status) &&
    (admin.cabecalhos.location ?? "").includes("/admin/entrar")
  : admin.status === 200 && admin.corpo.includes("O site está sendo feito");
ok(
  "/admin no domínio não entrega o painel sem sessão",
  painelFechado,
  `status ${admin.status}${admin.cabecalhos.location ? ` → ${admin.cabecalhos.location}` : ""}`
);

/**
 * `www` vai para o apex, em 308, guardando o caminho.
 *
 * Os dois respondendo 200 é conteúdo duplicado: o buscador vê dois sites
 * iguais e divide a autoridade. O `canonical` segura o caso, mas o 308 é o que
 * o Google pede — e é o que faz um link compartilhado com `www` somar no
 * endereço certo.
 */
const www = await pegar("/bolsas", `www.${DOMINIO}`);
const passouNoWww =
  [301, 308].includes(www.status) &&
  (www.cabecalhos.location ?? "").includes(`${DOMINIO}/bolsas`) &&
  !(www.cabecalhos.location ?? "").includes("www.");

/**
 * A regra compara o host com o domínio que o site DECLARA (`urlDoSite()`), e o
 * `.env.local` não define `NEXT_PUBLIC_SITE_URL` — local, o declarado é
 * `localhost:3000`, então `www.crochecomraquel.com.br` não é o `www` de
 * ninguém e o 308 legitimamente não acontece.
 *
 * Cobrar aqui seria acusar falso em toda execução local, e verificação que
 * acusa falso é verificação que as pessoas aprendem a ignorar. Contra produção,
 * onde a regra vale, ela é cobrada.
 *
 * Para exercer a regra localmente:
 *   NEXT_PUBLIC_SITE_URL=https://crochecomraquel.com.br pnpm dev
 */
const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(BASE);
if (LOCAL && !passouNoWww) {
  console.log(
    "· www → apex: não cobrado local, porque o site declara `localhost`. " +
      "Ver o comentário no script."
  );
} else {
  ok(
    "www redireciona para o apex, guardando o caminho",
    passouNoWww,
    `${www.status} → ${www.cabecalhos.location ?? "sem Location"}`
  );
}

// O preview vê o site completo...
const preview = await pegar("/", PREVIEW);
ok("o preview vê o site completo", preview.corpo.includes("carrega por anos"));

// ...mas fora do buscador. Sem isto, dois endereços com o mesmo site competem.
ok(
  "e sai com X-Robots-Tag noindex",
  (preview.cabecalhos["x-robots-tag"] ?? "").includes("noindex"),
  preview.cabecalhos["x-robots-tag"] ?? "ausente"
);

// O gate do admin é o que mais dói quebrar em silêncio: o proxy passa um
// middleware próprio ao next-auth, e nesse caminho o callback `authorized`
// é ignorado. Se alguém devolver o gate para lá, isto reprova.
// Estes dois vão com o host do PREVIEW de propósito. Sem host eles herdavam o
// da URL_BASE, o que passava no localhost (que vê o site inteiro) e reprovava
// contra o ar: no domínio /admin cai na obra, e é isso que tem de acontecer. O
// gate do painel só existe onde o site existe.
const semSessao = await pegar("/admin/produtos", PREVIEW);
ok(
  "/admin sem sessão redireciona para a entrada",
  semSessao.status === 307 && (semSessao.cabecalhos.location ?? "").includes("/admin/entrar"),
  `status ${semSessao.status}`
);
const entrada = await pegar("/admin/entrar", PREVIEW);
ok("e a própria tela de entrada responde 200", entrada.status === 200, `status ${entrada.status}`);

console.log(falhas === 0 ? "\n✓ hospedagem ok" : `\n✗ ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
