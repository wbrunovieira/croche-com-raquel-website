import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { Logo } from "@/components/brand/logo";
import { FormularioDeEntrada } from "./formulario";

export const metadata: Metadata = { title: "Entrar" };

export default async function PaginaDeEntrada({
  searchParams,
}: PageProps<"/admin/entrar">) {
  const sessao = await auth();
  if (sessao?.user) redirect("/admin");

  const { erro } = await searchParams;

  async function entrar(dadosDoFormulario: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        usuario: dadosDoFormulario.get("usuario"),
        senha: dadosDoFormulario.get("senha"),
        redirectTo: "/admin",
      });
    } catch (e) {
      // O signIn sinaliza o redirecionamento lançando — repassar é o certo.
      if (e instanceof AuthError) {
        redirect("/admin/entrar?erro=1");
      }
      throw e;
    }
  }

  return (
    <main className="grid flex-1 place-items-center px-borda-pagina py-secao">
      <div className="w-full max-w-sm">
        <Logo className="text-t3 text-primaria" />
        <h1 className="mt-respiro font-display text-t2">Entrar no painel</h1>
        <p className="mt-3 text-apoio text-conteudo-suave">
          Aqui você cadastra as peças, as cores e os textos do site.
        </p>

        <div className="mt-bloco">
          <FormularioDeEntrada acao={entrar} erro={typeof erro === "string"} />
        </div>
      </div>
    </main>
  );
}
