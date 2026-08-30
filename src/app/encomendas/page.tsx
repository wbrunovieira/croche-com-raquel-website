import type { Metadata } from "next";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Briefing } from "@/components/site/briefing";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";

export const metadata: Metadata = {
  title: "Encomenda sob medida",
  description:
    "Peça uma peça de crochê feita sob medida: você escolhe o tipo, a cor, a medida e o prazo, e conversamos pelo WhatsApp.",
  alternates: { canonical: "/encomendas" },
};

export default async function PaginaDeEncomendas() {
  const config = await buscarConfiguracoes();

  return (
    <main className="container-site secao">
      <Etiqueta>Sob medida</Etiqueta>
      <h1 className="mt-2 max-w-[18ch] font-display text-t1">
        A peça que você quer, do jeito que você quer
      </h1>
      <p className="mt-4 max-w-texto text-lead text-conteudo-suave">
        Não achou no catálogo? Tudo aqui já é feito sob encomenda — então fazer
        uma peça diferente é só uma questão de combinar. Me conte o que você tem
        em mente.
      </p>

      <div className="corrente mt-bloco max-w-texto" aria-hidden="true" />

      <div className="mt-respiro">
        <Briefing numeroDoWhatsapp={config.whatsappNumero} />
      </div>
    </main>
  );
}
