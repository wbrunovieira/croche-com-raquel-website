import { ImageResponse } from "next/og";
import { SIMBOLO_PATH, SIMBOLO_VIEWBOX } from "@/components/brand/simbolo";
import { CORES, TAMANHO, fontesDaMarca } from "@/lib/og/fontes";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";

/**
 * A imagem de compartilhamento da página de obra.
 *
 * **Ela não existia, e era por isso que o link não abria prévia no WhatsApp.**
 * O domínio serve a obra, e a obra declarava `og:title` e mais nada — sem
 * `og:image` não há o que o WhatsApp buscar. Enquanto isso o site tinha a sua
 * imagem pronta, mas ninguém a via: quem compartilha o endereço da Raquel hoje
 * compartilha a obra.
 *
 * **Sem foto, de propósito.** A arte do site põe a peça em metade do quadro,
 * porque quem chega ao catálogo quer ver a bolsa. Aqui não há catálogo para
 * mostrar — e o PNG que o `ImageResponse` emite comprime mal justamente onde há
 * foto: as artes com peça pesam de 528 a 893 kB, contra dezenas de kB quando são
 * marca e texto. Para a página que existe para dizer "em breve", o caminho leve
 * também é o honesto.
 */
export const alt = "Crochê com Raquel — bolsas e peças de crochê feitas à mão em Petrópolis";
export const size = TAMANHO;
export const contentType = "image/png";

export default async function Imagem() {
  const [config, fonts] = await Promise.all([buscarConfiguracoes(), fontesDaMarca()]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: CORES.fundo,
        }}
      >
        <svg viewBox={SIMBOLO_VIEWBOX} width={96} height={108}>
          <path d={SIMBOLO_PATH} fill={CORES.texto} fillRule="evenodd" />
        </svg>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Fraunces", fontSize: 78, lineHeight: 1.02, color: CORES.texto }}>
            Crochê com Raquel
          </div>
          <div style={{ fontFamily: "Karla", fontSize: 30, marginTop: 24, color: CORES.suave }}>
            {`Bolsas e peças feitas à mão, sob encomenda · ${config.cidade}`}
          </div>
        </div>

        <div style={{ display: "flex", fontFamily: "Karla", fontSize: 24, color: CORES.destaque }}>
          Encomendas pelo WhatsApp
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
