"use client";

import { useState } from "react";
import { classesDeBotao } from "@/components/ui/botao";
import { IconeZap } from "@/components/ui/icone-zap";
import { montarLinkWhatsApp, montarMensagemDeEncomenda } from "@/lib/whatsapp";

/**
 * Briefing da encomenda sob medida — **um campo só**.
 *
 * Eram cinco (peça, cores, medidas, prazo, detalhes). Cada um era uma pergunta
 * razoável, e juntos viravam um formulário: quem chega com vontade de encomendar
 * bate numa lista de perguntas e adia. O Bruno cortou com a razão certa — *"se o
 * cliente tiver muitos campos para preencher, ele posterga; na conversa a Raquel
 * esclarece todas as dúvidas"*.
 *
 * **A orientação não sumiu, mudou de lugar.** O que era rótulo de campo virou
 * exemplo no texto de apoio e no `placeholder`: quem quiser detalhar tem por onde
 * começar, e quem só quer perguntar escreve uma linha e manda. Cinco caixas
 * vazias cobram; uma frase de exemplo convida.
 *
 * Continua sem gravar nada: os campos existem para organizar o que a pessoa já ia
 * escrever no WhatsApp. Um formulário com servidor, e-mail e banco entregaria
 * menos e daria à Raquel outra caixa de entrada para acompanhar — ela já vive no
 * WhatsApp.
 */
export function Briefing({ numeroDoWhatsapp }: { numeroDoWhatsapp: string }) {
  const [pedido, setPedido] = useState("");

  const mensagem = montarMensagemDeEncomenda(pedido);
  const link = montarLinkWhatsApp(numeroDoWhatsapp, mensagem);

  return (
    /* Sem prévia da mensagem. Ela existia quando o briefing tinha cinco campos e
       montava uma ficha — ver o que sairia dali valia alguma coisa. Com um campo
       de texto livre, a prévia só repetia o que a pessoa acabou de escrever, ao
       lado do próprio campo. Repetir não informa: ocupa. */
    <div className="max-w-texto">
      <label htmlFor="pedido" className="block text-apoio font-medium">
        O que você tem em mente?
      </label>
      {/* Foi `inv-suave` enquanto o briefing morava na faixa verde. Ele se
          mudou para o creme junto com a fusão das seções, e a cor invertida
          aqui daria creme sobre creme. Cor de texto é do LUGAR, não do
          componente — e este componente mudou de lugar. */}
      <p className="mt-1 text-legenda text-conteudo-suave">
        Escreva do seu jeito. Se souber a cor, o tamanho ou a data, conte — se
        não souber, a Raquel ajuda a decidir na conversa.
      </p>
      {/* `text-conteudo` continua explícito. Na faixa verde ele era obrigatório
          — o campo tem fundo claro e herdava a cor invertida, 1,08:1. Aqui não
          faz falta, mas também não custa: campo com fundo próprio declarando a
          própria cor é o que impede este defeito de voltar na próxima mudança
          de lugar. */}
      <textarea
        id="pedido"
        rows={5}
        value={pedido}
        onChange={(e) => setPedido(e.target.value)}
        placeholder="Ex.: uma bolsa transversal em tom terracota, para usar no dia a dia. Queria até o Natal."
        className="mt-3 w-full rounded-fio border border-borda-forte bg-superficie px-campo-x py-campo-y text-base text-conteudo placeholder:text-conteudo-suave/60"
      />

      <div className="mt-bloco">
        <a
          className={classesDeBotao("primaria")}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconeZap className="size-5" />
          Enviar pelo WhatsApp
        </a>
        <p className="mt-3 text-apoio text-conteudo-suave">
          Nada é enviado daqui: o botão abre o seu WhatsApp com a mensagem
          pronta. Você lê antes de mandar.
        </p>
      </div>
    </div>
  );
}
