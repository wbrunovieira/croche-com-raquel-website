import { Cabecalho } from "@/components/site/cabecalho";
import { Rodape } from "@/components/site/rodape";

/**
 * Molde do site público. O admin fica fora deste grupo de rotas de propósito:
 * ele não deve herdar o cabeçalho e o rodapé da loja.
 */
export default function LayoutDoSite({ children }: LayoutProps<"/">) {
  return (
    <>
      <Cabecalho />
      {children}
      <Rodape />
    </>
  );
}
