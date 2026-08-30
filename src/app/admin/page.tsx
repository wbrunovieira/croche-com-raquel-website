import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Logo } from "@/components/brand/logo";
import { classesDeBotao } from "@/components/ui/botao";
import { Etiqueta } from "@/components/ui/etiqueta";

/**
 * Painel — por enquanto só a casca autenticada. As telas de cadastro entram
 * na etapa 10.
 */
export default async function PaginaDoAdmin() {
  const sessao = await auth();
  if (!sessao?.user) redirect("/admin/entrar");

  async function sair() {
    "use server";
    await signOut({ redirectTo: "/admin/entrar" });
  }

  return (
    <main className="container-site secao">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Logo className="text-t3 text-primaria" />
        <form action={sair}>
          <button className={classesDeBotao("secundaria", "sm")}>Sair</button>
        </form>
      </div>

      <div className="mt-respiro">
        <Etiqueta>Painel</Etiqueta>
        <h1 className="mt-2 font-display text-t1">Oi, {sessao.user.name}</h1>
        <p className="mt-4 max-w-texto text-leitura text-conteudo-suave">
          O acesso está funcionando. As telas de cadastro de peças, cores e
          textos entram na próxima etapa.
        </p>
      </div>
    </main>
  );
}
