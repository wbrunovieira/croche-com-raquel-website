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
      className="trama scroll-mt-cabecalho-lg bg-inv-fundo text-inv-conteudo"
    >
      <div className="container-site secao">
        <Revelar className="max-w-texto">
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

        <Revelar atraso={0.08} className="mt-respiro">
          <Briefing numeroDoWhatsapp={whatsappNumero} />
        </Revelar>
      </div>
    </section>
  );
}
