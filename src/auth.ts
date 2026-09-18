import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { configuracaoBase } from "./auth.config";
import { db } from "./lib/db";
import { conferirSenha } from "./lib/senha";

/**
 * Sete dias, e não os trinta que o next-auth assume por padrão.
 *
 * A sessão é um JWT: ele vale até vencer, e nada do lado do servidor o cancela.
 * Trinta dias significava que um cookie copiado do celular dela — ou deixado num
 * computador emprestado — abria o painel por um mês. Sete dias é o que ela
 * aguenta sem reclamar de reentrar e reduz a janela a um quarto.
 */
const DIAS_DE_SESSAO = 7;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...configuracaoBase,
  session: { strategy: "jwt", maxAge: DIAS_DE_SESSAO * 24 * 60 * 60 },
  callbacks: {
    /**
     * **Trocar a senha passa a expulsar quem já entrou.**
     *
     * Antes não expulsava: o JWT não é consultado contra o banco, então um
     * cookie roubado sobrevivia à troca de senha até o prazo vencer. Isso torna
     * a troca de senha — a única reação possível a um vazamento — inútil no
     * exato momento em que ela é necessária.
     *
     * O sinal é o `updatedAt` do usuário, que muda quando `pnpm admin:criar`
     * regrava o hash. Não precisou de coluna nova nem de migração: qualquer
     * alteração no usuário invalida a sessão, e alteração em usuário é raríssima.
     *
     * **O custo é uma consulta por leitura de sessão, e só para quem tem
     * cookie.** Visitante anônimo não chega aqui — o callback não roda sem
     * token —, então o site público não paga nada.
     */
    async jwt({ token, user }) {
      if (user?.id) {
        const dono = await db.user.findUnique({
          where: { id: user.id },
          select: { updatedAt: true },
        });
        return { ...token, sub: user.id, credenciaisEm: dono?.updatedAt.getTime() };
      }

      if (!token.sub) return token;

      const dono = await db.user.findUnique({
        where: { id: token.sub },
        select: { updatedAt: true },
      });
      // Usuário apagado, ou senha trocada depois de este cookie nascer: cai.
      if (!dono || dono.updatedAt.getTime() !== token.credenciaisEm) return null;
      return token;
    },
  },
  providers: [
    Credentials({
      credentials: { usuario: {}, senha: {} },
      async authorize(credenciais) {
        const usuarioDigitado = String(credenciais?.usuario ?? "").trim().toLowerCase();
        const senha = String(credenciais?.senha ?? "");
        if (!usuarioDigitado || !senha) return null;

        const usuario = await db.user.findUnique({ where: { username: usuarioDigitado } });

        // Mesmo sem usuário, roda a verificação contra um hash descartável.
        // Sem isso, "usuário não existe" responde em milissegundos e "senha
        // errada" demora — e essa diferença de tempo entrega quais usuários
        // estão cadastrados.
        const guardado =
          usuario?.passwordHash ??
          "scrypt$32768$8$1$00000000000000000000000000000000$" + "0".repeat(128);

        const confere = await conferirSenha(senha, guardado);
        if (!usuario || !confere) return null;

        return { id: usuario.id, name: usuario.name };
      },
    }),
  ],
});
