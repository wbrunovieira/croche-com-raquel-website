import { Etiqueta } from "@/components/ui/etiqueta";
import { Revelar } from "@/components/ui/revelar";
import { Briefing } from "@/components/site/briefing";

/**
 * Encomenda sob medida.
 *
 * O briefing **não grava nada**: monta a mensagem e abre o WhatsApp. Campo em
 * branco não vira linha vazia na mensagem, e nenhum campo é obrigatório.
 */
export function SecaoEncomendas({ whatsappNumero }: { whatsappNumero: string }) {
  return (
    <section
      id="encomendas"
      // `overflow-x-clip` porque a entrada aqui é horizontal: sem o corte, os
      // 20px de deslocamento viram rolagem lateral do corpo no celular.
      className="trama overflow-x-clip scroll-mt-cabecalho-lg bg-inv-fundo text-inv-conteudo"
    >
      {/* `secao--ampla`, com DOIS traços: padding de faixa invertida sobe um
          degrau (§3.3 do sistema de espaçamento). */}
      <div className="container-site secao--ampla">
        <Revelar entrada="trama" className="max-w-texto">
          <Etiqueta tom="invertido">Sob medida</Etiqueta>
          <h2 className="mt-2 max-w-[18ch] font-display text-t2">
            A peça que você quer, do jeito que você quer
          </h2>
          <p className="mt-4 text-lead text-inv-suave">
            Não achou no catálogo? Tudo aqui já é feito sob encomenda — então
            fazer uma peça diferente é só uma questão de combinar. Me conte o
            que você tem em mente.
          </p>
        </Revelar>

        {/* O briefing vem do outro lado, fechando a trama com o bloco de cima. */}
        <Revelar entrada="trama-inversa" atraso={0.08} className="mt-respiro">
          <Briefing numeroDoWhatsapp={whatsappNumero} />
        </Revelar>
      </div>
    </section>
  );
}
