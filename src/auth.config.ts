import type { NextAuthConfig } from "next-auth";

/**
 * Configuração sem banco e sem Node, para o proxy poder importar.
 *
 * O proxy roda antes da página e precisa ser leve; o provedor de credenciais
 * usa Prisma e `node:crypto`, que não cabem aqui. Por isso a configuração é
 * dividida: isto define as rotas e quem pode entrar, e `auth.ts` acrescenta o
 * provedor.
 */
export const configuracaoBase = {
  pages: {
    signIn: "/admin/entrar",
  },
  callbacks: {
    authorized({ auth, request }) {
      const logado = Boolean(auth?.user);
      const noAdmin = request.nextUrl.pathname.startsWith("/admin");
      const naTelaDeEntrada = request.nextUrl.pathname === "/admin/entrar";

      if (naTelaDeEntrada) return true;
      if (noAdmin) return logado;
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
