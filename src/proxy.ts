import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { configuracaoBase } from "@/auth.config";
import { CAMINHO_DA_OBRA, ehDominioDeProducao, mostraSiteCompleto } from "@/lib/hospedagem";

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

  if (!mostraSiteCompleto(host)) {
    // Reescrita, não redirecionamento: a visitante fica na URL que digitou.
    if (pathname === CAMINHO_DA_OBRA) return NextResponse.next();
    return NextResponse.rewrite(new URL(CAMINHO_DA_OBRA, req.url));
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
  // buscador lê direto (`robots.txt`, `sitemap.xml`) — esses decidem sozinhos,
  // pelo host, e não devem virar página de obra.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
