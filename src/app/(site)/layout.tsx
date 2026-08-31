import { Cabecalho } from "@/components/site/cabecalho";
import { Rodape } from "@/components/site/rodape";
import { DadosEstruturados, negocioLocal } from "@/components/seo/dados-estruturados";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";

/**
 * Molde do site público. O admin fica fora deste grupo de rotas de propósito:
 * ele não deve herdar o cabeçalho e o rodapé da loja.
 */
export default async function LayoutDoSite({ children }: LayoutProps<"/">) {
  const config = await buscarConfiguracoes();

  return (
    <>
      <DadosEstruturados
        dados={negocioLocal({
          cidade: config.cidade,
          whatsappNumero: config.whatsappNumero,
          instagramUrl: config.instagramUrl,
          email: config.email,
        })}
      />
      <Cabecalho />
      {children}
      <Rodape />
    </>
  );
}
