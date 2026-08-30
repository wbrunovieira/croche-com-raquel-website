import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Exige sessão. O proxy já barra `/admin`, mas ele decide por rota — e uma
 * ação de servidor pode ser chamada direto, sem passar por navegação. Toda
 * ação do painel chama isto antes de escrever no banco.
 */
export async function exigirSessao() {
  const sessao = await auth();
  if (!sessao?.user) redirect("/admin/entrar");
  return sessao.user;
}
