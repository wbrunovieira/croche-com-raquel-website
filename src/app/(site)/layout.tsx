import { AncoraNaAbertura } from "@/components/site/ancora-na-abertura";
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
      {/* **Pular para o conteúdo** — WCAG 2.4.1.

          Antes do `<main>` vêm sete itens de menu, o Instagram e o botão do
          WhatsApp, em TODA página. Quem navega por teclado atravessava os nove
          de novo a cada página para chegar ao conteúdo; quem usa leitor de tela,
          idem. É o primeiro focável do documento e só aparece ao receber foco.

          `sr-only` com `focus:not-sr-only` é o padrão: invisível para quem não
          precisa, e um botão de verdade para quem precisa — link de pular que
          fica escondido MESMO no foco é a versão que não ajuda ninguém. */}
      <a
        href="#topo"
        className="sr-only rounded-fio bg-primaria px-4 py-3 text-sobre-primaria focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]"
      >
        Pular para o conteúdo
      </a>
      <AncoraNaAbertura />
      <Cabecalho />
      {children}
      <Rodape />
    </>
  );
}
