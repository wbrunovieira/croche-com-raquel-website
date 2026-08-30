/**
 * URL canônica do site. Usada no link que vai dentro da mensagem de WhatsApp,
 * nos metadados e, mais adiante, no sitemap.
 *
 * A ordem importa: `NEXT_PUBLIC_SITE_URL` é o domínio definitivo e vence
 * sempre; as variáveis da Vercel cobrem preview e produção enquanto o domínio
 * não estiver configurado; localhost é o último recurso, em desenvolvimento.
 */
export function urlDoSite(): string {
  const explicita = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicita) return explicita.replace(/\/+$/, "");

  const producao = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (producao) return `https://${producao}`;

  const deploy = process.env.VERCEL_URL;
  if (deploy) return `https://${deploy}`;

  return "http://localhost:3000";
}

export function urlDoProduto(slug: string): string {
  return `${urlDoSite()}/produtos/${slug}`;
}
