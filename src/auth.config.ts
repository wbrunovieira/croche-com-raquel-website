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
  // Sem callback `authorized` de propósito. O `proxy.ts` passa um middleware
  // próprio para o `auth()`, e nesse caminho o next-auth **descarta** o
  // booleano deste callback (ver o ramo `else if (userMiddlewareOrRoute)` em
  // `node_modules/next-auth/lib/index.js`). Um `authorized` aqui pareceria
  // proteger o `/admin` sem proteger nada. A regra mora no `proxy.ts`.
  providers: [],
} satisfies NextAuthConfig;
