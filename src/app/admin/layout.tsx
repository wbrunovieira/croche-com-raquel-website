import type { Metadata } from "next";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Logo } from "@/components/brand/logo";
import { NavegacaoDoAdmin } from "@/components/admin/navegacao";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel" },
  // O painel nunca deve aparecer em buscador.
  robots: { index: false, follow: false },
};

export default async function LayoutDoAdmin({ children }: LayoutProps<"/admin">) {
  const sessao = await auth();

  // A tela de entrada usa este layout mas ainda não tem sessão — nesse caso
  // não há barra de navegação para mostrar.
  if (!sessao?.user) {
    return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
  }

  async function sair() {
    "use server";
    await signOut({ redirectTo: "/admin/entrar" });
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-borda bg-superficie">
        <div className="container-site flex h-cabecalho items-center justify-between gap-6">
          <Link href="/admin" aria-label="Painel">
            <Logo variante="linha" className="h-9 text-primaria" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-apoio text-conteudo-suave hover:text-conteudo"
            >
              Ver o site
            </Link>
            <form action={sair}>
              <button className="text-apoio text-destaque-texto underline underline-offset-4 hover:no-underline">
                Sair
              </button>
            </form>
          </div>
        </div>
        <NavegacaoDoAdmin />
      </header>

      <div className="flex-1 bg-cru-fundo/40">{children}</div>
    </div>
  );
}
