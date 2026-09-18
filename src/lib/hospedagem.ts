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

/**
 * O domínio que o site declara como seu — a base de `urlDoSite()`.
 *
 * **O `catch` grita, e isso importa mais do que parece.** Se
 * `NEXT_PUBLIC_SITE_URL` vier malformada, isto devolve `null`,
 * `ehDominioDeProducao` passa a ser falso para TODO host, e o proxy carimba
 * `X-Robots-Tag: noindex` em todas as respostas de produção. O site fica no ar,
 * bonito, funcionando — e invisível no Google, sem nada acusar. É o defeito mais
 * caro e mais silencioso que este arquivo pode produzir; um `console.error` é o
 * mínimo para que ele apareça no log da Vercel em vez de só no faturamento dela
 * meses depois.
 */
function dominioDeclarado(): string | null {
  try {
    return normalizar(new URL(urlDoSite()).host);
  } catch (erro) {
    console.error(
      "NEXT_PUBLIC_SITE_URL malformada — o site vai sair com noindex em TODO host:",
      urlDoSite(),
      erro
    );
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
 * O `preview.` deve mandar a visitante para o domínio?
 *
 * **Só depois da estreia.** Antes dela, `preview.` é o ÚNICO lugar onde o site
 * existe — redirecionar ali levaria todo mundo para a página de obra, que é o
 * oposto do que ele serve. Por isso a condição é o próprio interruptor do
 * lançamento.
 *
 * **E por que redirecionar, já que o `noindex` e o `canonical` já protegem o
 * buscador.** O motivo não é SEO, é o que já está circulando: a Raquel passou
 * semanas mandando `preview.crochecomraquel.com.br/produtos/...` por WhatsApp.
 * Quem abre um daqueles hoje vê uma página que funciona e é invisível para o
 * Google — e se repassar o link, a divulgação segue no endereço errado. Um 308
 * conserta todos esses links de uma vez, sem ninguém reenviar nada.
 *
 * Depois da estreia o `preview.` também perdeu a função: ele e o domínio são o
 * mesmo deploy, e a única diferença era o `noindex`. Ambiente de teste de
 * verdade, se um dia fizer falta, é outro host apontando para outro deploy.
 */
export function ehPreviewParaRedirecionar(host: string): boolean {
  if (process.env.SITE_NO_AR !== "true") return false;
  const declarado = dominioDeclarado();
  if (!declarado) return false;
  const h = normalizar(host);
  return h === `preview.${declarado}`;
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
