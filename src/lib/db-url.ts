/**
 * O Neon entrega a URL com `sslmode=require`. Hoje o driver `pg` trata
 * `require` como `verify-full` (verifica o certificado do servidor), mas na
 * próxima major isso passa a valer a semântica fraca do libpq, que não
 * verifica. Fixar `verify-full` explicitamente mantém a verificação quando
 * essa mudança chegar — e cala o aviso de segurança no console.
 *
 * O certificado do Neon é de autoridade pública, então não é preciso CA extra.
 */
export function urlComSslVerificado(url: string | undefined): string {
  if (!url) {
    throw new Error(
      "DATABASE_URL não está definida. Rode `vercel env pull .env.local --yes`."
    );
  }
  const u = new URL(url);
  const modo = u.searchParams.get("sslmode");
  if (modo === null || modo === "require" || modo === "prefer" || modo === "verify-ca") {
    u.searchParams.set("sslmode", "verify-full");
  }
  return u.toString();
}
