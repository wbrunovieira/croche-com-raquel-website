/**
 * Verificação do roteamento por host.
 *
 * Enquanto o catálogo não estreia, o domínio mostra a página de obra e só o
 * `preview.` (e o localhost) veem o site completo. Duas coisas podem quebrar
 * em silêncio e só aparecer depois do deploy: o site inacabado vazar no
 * domínio, e o preview competir com o domínio no buscador.
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

// O domínio mostra a obra, e mostra em toda rota — não só na raiz.
for (const rota of ["/", "/bolsas", "/produtos/bolsa-saco-cafe"]) {
  const { corpo } = await pegar(rota, DOMINIO);
  ok(`${rota} no domínio cai na página de obra`, corpo.includes("O site está sendo feito"));
}

// E o painel não fica exposto por ali.
const admin = await pegar("/admin", DOMINIO);
ok(
  "/admin no domínio cai na obra, e não no painel",
  admin.status === 200 && admin.corpo.includes("O site está sendo feito"),
  `status ${admin.status}`
);

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
