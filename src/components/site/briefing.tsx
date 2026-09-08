"use client";

import { useState } from "react";
import { classesDeBotao } from "@/components/ui/botao";
import { Etiqueta } from "@/components/ui/etiqueta";
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
    <div className="grid gap-x-coluna gap-y-grade-linha lg:grid-cols-2">
      <div>
        <label htmlFor="pedido" className="block text-apoio font-medium">
          O que você tem em mente?
        </label>
        {/* `inv-suave`, e não `conteudo-suave`: este bloco vive na faixa verde,
            e a cor do tema claro dava 2,15:1 de contraste — abaixo do mínimo de
            4,5:1, praticamente ilegível. O rótulo passava porque herda a cor
            invertida da seção; estes dois parágrafos não herdavam nada. */}
        <p className="mt-1 text-legenda text-inv-suave">
          Escreva do seu jeito. Se souber a cor, o tamanho ou a data, conte —
          se não souber, a Raquel ajuda a decidir na conversa.
        </p>
        <textarea
          id="pedido"
          rows={5}
          value={pedido}
          onChange={(e) => setPedido(e.target.value)}
          placeholder="Ex.: uma bolsa transversal em tom terracota, para usar no dia a dia. Queria até o Natal."
          className="mt-3 w-full rounded-fio border border-borda-forte bg-superficie px-campo-x py-campo-y text-base placeholder:text-conteudo-suave/60"
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
          <p className="mt-3 text-apoio text-inv-suave">
            Nada é enviado daqui: o botão abre o seu WhatsApp com a mensagem
            pronta. Você lê antes de mandar.
          </p>
        </div>
      </div>

      <div className="lg:sticky lg:top-cabecalho-lg lg:self-start">
        <div className="trama rounded-card bg-inv-fundo p-painel">
          <Etiqueta tom="invertido">A mensagem que vai</Etiqueta>
          {/* `<pre>` comum, sem animação: com `key={mensagem}` isto desmontava e
              remontava a cada TECLA digitada, piscando de 0,4 para 1 de
              opacidade. Quem escreve "Bolsa transversal" via o painel piscar
              dezoito vezes — e num Android médio era um remount de nó de texto
              por keystroke. O texto já muda; não precisa se anunciar. */}
          <pre className="mt-bloco overflow-x-auto rounded-fio bg-verde-musgo p-4 font-texto text-apoio leading-relaxed whitespace-pre-wrap text-inv-conteudo">
            {mensagem}
          </pre>
          {pedido.trim() === "" ? (
            <p className="mt-4 text-legenda text-inv-suave">
              Pode mandar assim mesmo. A saudação já vai pronta — o resto vocês
              combinam na conversa.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
