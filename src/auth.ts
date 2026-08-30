import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { configuracaoBase } from "./auth.config";
import { db } from "./lib/db";
import { conferirSenha } from "./lib/senha";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...configuracaoBase,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, senha: {} },
      async authorize(credenciais) {
        const email = String(credenciais?.email ?? "").trim().toLowerCase();
        const senha = String(credenciais?.senha ?? "");
        if (!email || !senha) return null;

        const usuario = await db.user.findUnique({ where: { email } });

        // Mesmo sem usuário, roda a verificação contra um hash descartável.
        // Sem isso, "e-mail não existe" responde em milissegundos e "senha
        // errada" demora — e essa diferença de tempo entrega quais e-mails
        // estão cadastrados.
        const guardado =
          usuario?.passwordHash ??
          "scrypt$32768$8$1$00000000000000000000000000000000$" + "0".repeat(128);

        const confere = await conferirSenha(senha, guardado);
        if (!usuario || !confere) return null;

        return { id: usuario.id, name: usuario.name, email: usuario.email };
      },
    }),
  ],
});
