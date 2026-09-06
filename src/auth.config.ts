import type { NextAuthConfig } from "next-auth";
import { urlDoSite } from "@/lib/site";

/**
 * Configuração sem banco e sem Node, para o proxy poder importar.
 *
 * O proxy roda antes da página e precisa ser leve; o provedor de credenciais
 * usa Prisma e `node:crypto`, que não cabem aqui. Por isso a configuração é
 * dividida: isto define as rotas e quem pode entrar, e `auth.ts` acrescenta o
 * provedor.
 */
/**
 * Nome de cookie próprio, em vez do `authjs.*` padrão.
 *
 * Cookie de `localhost` **não separa por porta**: o navegador manda o mesmo
 * cookie para todo projeto que rode ali. O Bruno tem seis projetos com
 * Auth.js, cada um com o seu `AUTH_SECRET` — com o nome padrão, entrar em um
 * derruba a sessão dos outros e o log enche de `no matching decryption
 * secret`. Nome próprio resolve na raiz.
 *
 * Os prefixos seguem a convenção do próprio Auth.js: `__Secure-` exige HTTPS,
 * `__Host-` exige HTTPS mais caminho `/` e nenhum domínio. Sem HTTPS o
 * navegador **recusa** cookie com esses prefixos, então eles só entram quando
 * o site declara `https://` — senão o login quebraria em desenvolvimento.
 */
const SOBRE_HTTPS = urlDoSite().startsWith("https://");
const seguro = (nome: string) => `${SOBRE_HTTPS ? "__Secure-" : ""}${nome}`;

export const configuracaoBase = {
  pages: {
    signIn: "/admin/entrar",
  },
  cookies: {
    sessionToken: { name: seguro("croche.session-token") },
    callbackUrl: { name: seguro("croche.callback-url") },
    csrfToken: {
      name: `${SOBRE_HTTPS ? "__Host-" : ""}croche.csrf-token`,
    },
  },
  // Sem callback `authorized` de propósito. O `proxy.ts` passa um middleware
  // próprio para o `auth()`, e nesse caminho o next-auth **descarta** o
  // booleano deste callback (ver o ramo `else if (userMiddlewareOrRoute)` em
  // `node_modules/next-auth/lib/index.js`). Um `authorized` aqui pareceria
  // proteger o `/admin` sem proteger nada. A regra mora no `proxy.ts`.
  providers: [],
} satisfies NextAuthConfig;
