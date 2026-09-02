import type { Metadata } from "next";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { IconeZap } from "@/components/ui/icone-zap";

/**
 * Página de obra do domínio.
 *
 * Fica fora do grupo `(site)` de propósito: herdar o cabeçalho e o rodapé
 * daria à visitante um menu inteiro para um site que ainda não está no ar.
 *
 * **Sem o logotipo, só tipografia** — pedido do Bruno. O nome sai em Fraunces,
 * que é a mesma voz da marca; o que falta é o símbolo, não a identidade.
 *
 * O WhatsApp entra porque a Raquel já vende hoje: uma página de obra sem
 * saída joga fora quem chegou pelo Instagram procurando encomendar.
 */
export const metadata: Metadata = {
  title: "Crochê com Raquel — em breve",
  description:
    "Bolsas, mesa posta e decoração em crochê e macramê, feitas à mão sob encomenda em Petrópolis/RJ. O site está a caminho — as encomendas, não: fale pelo WhatsApp.",
  alternates: { canonical: "/" },
};

export default async function PaginaEmConstrucao() {
  const config = await buscarConfiguracoes();

  return (
    <main className="trama flex min-h-svh flex-col justify-between bg-inv-fundo text-inv-conteudo">
      <div className="container-site secao flex flex-1 flex-col justify-center">
        <p className="font-texto text-etiqueta uppercase tracking-[0.2em] text-inv-suave">
          {config.cidade} · feito à mão
        </p>

        <h1 className="mt-6 max-w-[12ch] font-display text-display leading-[0.95]">
          Crochê com Raquel
        </h1>

        <p className="mt-8 max-w-texto text-lead text-inv-conteudo">
          Bolsas, mesa posta e decoração em crochê e macramê — feitas à mão, uma
          de cada vez, sob encomenda.
        </p>

        <p className="mt-4 max-w-texto text-leitura text-inv-suave">
          O site está sendo feito com o mesmo cuidado das peças. Enquanto ele não
          fica pronto, a encomenda continua onde sempre esteve: no WhatsApp.
        </p>

        <div className="mt-bloco flex flex-wrap items-center gap-x-8 gap-y-4 text-leitura">
          <a
            href={`https://wa.me/${config.whatsappNumero}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-btn-icone underline underline-offset-4 hover:no-underline"
          >
            <IconeZap className="size-5" />
            Encomendar pelo WhatsApp
          </a>
          {config.instagramUrl ? (
            <a
              href={config.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 text-inv-suave hover:no-underline"
            >
              @croche.comraquel
            </a>
          ) : null}
        </div>
      </div>

      <div className="corrente corrente--claro" aria-hidden="true" />
    </main>
  );
}
