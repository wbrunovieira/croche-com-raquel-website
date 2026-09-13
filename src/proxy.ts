import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { configuracaoBase } from "@/auth.config";
import {
  CAMINHO_DA_OBRA,
  ehDominioDeProducao,
  ehWwwDoDominio,
  mostraSiteCompleto,
} from "@/lib/hospedagem";

const { auth } = NextAuth(configuracaoBase);

/**
 * Proxy do site. Faz duas coisas, nesta ordem.
 *
 * **1. Decide qual site o host recebe.** Enquanto o catálogo não estreia, o
 * domínio mostra a página de obra e só `preview.` (e o localhost) veem o site
 * completo. É uma *allowlist*: host desconhecido cai na obra, em vez de vazar
 * o site inacabado. `SITE_NO_AR=true` derruba a obra no dia do lançamento, sem
 * mexer em código.
 *
 * **2. Protege o `/admin`.** A regra mora aqui, e não no callback `authorized`
 * de `auth.config.ts`, por um detalhe do next-auth: em `handleAuth`, quando um
 * middleware próprio é passado para `auth()`, ele roda num `else if` que
 * **descarta o booleano do `authorized`** — o gate sumiria em silêncio. Ver
 * `node_modules/next-auth/lib/index.js`, o ramo `else if (userMiddlewareOrRoute)`.
 */
export default auth(function proxy(req) {
  const host = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;

  // `www` vai para o apex, e vai ANTES de tudo: assim a decisão de obra ou site
  // é tomada uma vez só, no endereço definitivo, e não duas vezes em hosts que
  // deveriam ser o mesmo lugar.
  if (ehWwwDoDominio(host)) {
    const apex = req.nextUrl.clone();
    apex.host = host.replace(/^www\./i, "");
    // A porta é zerada à parte: o `NextURL` a guarda separada do host, então
    // trocar só o host deixava um `:3000` colado no destino. Em produção não há
    // porta para herdar, mas um redirecionamento que só está certo em produção é
    // um redirecionamento que ninguém consegue testar antes.
    apex.port = "";
    return NextResponse.redirect(apex, 308);
  }

  if (!mostraSiteCompleto(host)) {
    // Reescrita, não redirecionamento: a visitante fica na URL que digitou.
    const obra =
      pathname === CAMINHO_DA_OBRA
        ? NextResponse.next()
        : NextResponse.rewrite(new URL(CAMINHO_DA_OBRA, req.url));
    // A obra fica FORA do buscador enquanto existir. Sem isto o domínio é
    // indexável — `ehDominioDeProducao` é verdadeiro para o apex — e o Google
    // guardaria "Crochê com Raquel — em breve" como a descrição do site. Esse
    // trecho sobrevive semanas ao lançamento.
    obra.headers.set("X-Robots-Tag", "noindex, nofollow");
    return obra;
  }

  const noAdmin = pathname.startsWith("/admin");
  const naTelaDeEntrada = pathname === "/admin/entrar";
  if (noAdmin && !naTelaDeEntrada && !req.auth) {
    const entrada = req.nextUrl.clone();
    entrada.pathname = "/admin/entrar";
    entrada.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(entrada);
  }

  const resposta = NextResponse.next();
  // Os dois hosts vivem no mesmo deploy, então o `VERCEL_ENV` não distingue um
  // do outro: o cabeçalho é o que impede o preview de competir com o domínio
  // no buscador. Vale para tudo — página, imagem de compartilhamento, feed.
  if (!ehDominioDeProducao(host)) {
    resposta.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return resposta;
});

export const config = {
  // O site inteiro passa pelo proxy agora, porque a escolha do host precisa
  // valer em toda rota. Ficam de fora os estáticos e os arquivos que o
  // buscador lê direto (`robots.txt`, `sitemap.xml`, `llms.txt`) — esses
  // decidem sozinhos, pelo host, e não devem virar página de obra.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
