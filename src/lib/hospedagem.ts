/**
 * Quem vê o quê, por host.
 *
 * Enquanto o catálogo não estreia, o domínio mostra a página de obra e o site
 * completo fica em `preview.`. As duas coisas vivem no mesmo deploy, então
 * `VERCEL_ENV` não serve para distingui-las — quem distingue é o host.
 *
 * Mora fora do `proxy.ts` porque o `robots.ts` precisa da mesma decisão, e as
 * duas discordarem seria o pior dos mundos: um `robots.txt` liberando o que a
 * visitante nem consegue ver.
 */
import { urlDoSite } from "@/lib/site";

export const CAMINHO_DA_OBRA = "/em-construcao";

/** Só o hostname, sem porta e em minúsculas. */
function normalizar(host: string): string {
  return host.split(":")[0]!.trim().toLowerCase();
}

/** O domínio que o site declara como seu — a base de `urlDoSite()`. */
function dominioDeclarado(): string | null {
  try {
    return normalizar(new URL(urlDoSite()).host);
  } catch {
    return null;
  }
}

/**
 * O host é o domínio público (apex ou `www`)? É por aqui que se decide o
 * `noindex`: tudo que não for o domínio declarado fica fora do buscador.
 */
export function ehDominioDeProducao(host: string): boolean {
  const declarado = dominioDeclarado();
  if (!declarado) return false;
  const h = normalizar(host);
  return h === declarado || h === `www.${declarado}` || `www.${h}` === declarado;
}

/**
 * O host é a versão `www.` do domínio declarado?
 *
 * Serve ao 301 do proxy. `www` e apex servindo os dois com status 200 é o
 * clássico de conteúdo duplicado: o buscador vê dois sites idênticos e divide a
 * autoridade entre eles. O `canonical` já apontava para o apex e segura o caso
 * — mas 301 é o que o Google pede, e é o que faz o link que alguém compartilhou
 * com `www` somar no endereço certo em vez de num vizinho.
 */
export function ehWwwDoDominio(host: string): boolean {
  const declarado = dominioDeclarado();
  if (!declarado) return false;
  const h = normalizar(host);
  return h === `www.${declarado}` && h !== declarado;
}

/**
 * O host recebe o site completo, ou a página de obra?
 *
 * **Allowlist, não blocklist.** Um host novo — um domínio recém-apontado, um
 * alias que alguém criou na Vercel — cai na obra por padrão. O contrário
 * vazaria o site inacabado para o público sem ninguém perceber.
 */
export function mostraSiteCompleto(host: string): boolean {
  // O interruptor do lançamento: a obra some e o domínio serve o site.
  if (process.env.SITE_NO_AR === "true") return true;

  const h = normalizar(host);
  return (
    h.startsWith("preview.") ||
    h === "localhost" ||
    h === "127.0.0.1" ||
    // As URLs de deploy da Vercel: é por elas que a gente confere o build
    // antes de apontar o domínio. Saem com `noindex`.
    h.endsWith(".vercel.app")
  );
}
