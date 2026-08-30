import NextAuth from "next-auth";
import { configuracaoBase } from "@/auth.config";

// O proxy só decide quem passa. A verificação de senha acontece no servidor,
// com a configuração completa de `auth.ts`.
export const { auth: proxy } = NextAuth(configuracaoBase);

export default proxy;

export const config = {
  // Só o admin é protegido. O site é público inteiro.
  matcher: ["/admin/:path*"],
};
