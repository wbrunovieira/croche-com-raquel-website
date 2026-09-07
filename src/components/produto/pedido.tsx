"use client";

import { useMemo, useState } from "react";
import { classesDeBotao } from "@/components/ui/botao";
import { CampoQuantidade } from "@/components/ui/campo-quantidade";
import { IconeZap } from "@/components/ui/icone-zap";
import { codigoDoProduto, montarLinkWhatsApp, montarMensagem } from "@/lib/whatsapp";

/**
 * O bloco de pedido — é aqui que o site converte.
 *
 * O site é a vitrine da Raquel: ele diz QUAL peça a cliente está olhando e abre
 * a conversa. Cor, tamanho e acabamento saíram daqui de propósito — ela
 * esclarece isso no atendimento, e um formulário de escolhas entre a peça e o
 * botão só atrasava quem já tinha decidido falar com ela.
 *
 * A quantidade fica: é a única informação que a cliente tem e a Raquel não, e
 * ela muda o orçamento.
 *
 * **O botão é sempre um `<a>` com `href` pronto no primeiro quadro.** Sem
 * estado pendente, sem `aria-disabled`, sem handler de clique: nada roda entre
 * o toque e o WhatsApp abrindo.
 */
export function Pedido({
  nomeDoProduto,
  slugDoProduto,
  numeroDoWhatsapp,
  template,
  urlDaPagina,
}: {
  nomeDoProduto: string;
  slugDoProduto: string;
  numeroDoWhatsapp: string;
  template: string;
  urlDaPagina: string;
}) {
  const [quantidade, setQuantidade] = useState(1);

  const link = useMemo(() => {
    const mensagem = montarMensagem(template, {
      produto: nomeDoProduto,
      codigo: codigoDoProduto(slugDoProduto),
      quantidade,
      link: urlDaPagina,
    });
    return montarLinkWhatsApp(numeroDoWhatsapp, mensagem);
  }, [nomeDoProduto, numeroDoWhatsapp, quantidade, slugDoProduto, template, urlDaPagina]);

  return (
    <div>
      <div>
        <p className="text-apoio font-medium">Quantidade</p>
        <div className="mt-3">
          <CampoQuantidade valor={quantidade} aoMudar={setQuantidade} />
        </div>
      </div>

      {/* No desktop o botão fica no fluxo; no mobile ele também vira barra fixa
          no rodapé, porque a página é longa e o CTA não pode ficar para trás. */}
      <div className="mt-bloco hidden sm:block">
        <BotaoPedir link={link} />
      </div>

      <p className="mt-3 text-apoio text-conteudo-suave">
        Cor, tamanho e acabamento a Raquel combina com você na conversa.
      </p>

      {/* A barra fixa cobre o fim da página; quem reserva o espaço dela é o
          rodapé (`pb-zap-flutua sm:pb-0`), porque ele é o último elemento do
          documento — um espaçador aqui dentro ficaria no meio da página. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-superficie/95 p-4 backdrop-blur sm:hidden">
        <BotaoPedir link={link} bloco />
      </div>
    </div>
  );
}

function BotaoPedir({ link, bloco = false }: { link: string; bloco?: boolean }) {
  return (
    <a
      className={`${classesDeBotao("primaria")} ${bloco ? "w-full" : ""}`}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <IconeZap className="size-5" />
      Pedir pelo WhatsApp
    </a>
  );
}
