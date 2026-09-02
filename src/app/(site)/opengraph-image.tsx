import { ImageResponse } from "next/og";
import { SIMBOLO_PATH, SIMBOLO_VIEWBOX } from "@/components/brand/simbolo";
import { CORES, TAMANHO, fontesDaMarca } from "@/lib/og/fontes";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";

export const alt = "Crochê com Raquel — peças de crochê feitas à mão em Petrópolis";
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
          background: CORES.fundo,
          color: CORES.texto,
          padding: 72,
        }}
      >
        {/* Largura derivada da altura pela proporção do símbolo (0,885:1) —
            escrever as duas à mão deforma o desenho no dia em que uma mudar. */}
        <svg viewBox={SIMBOLO_VIEWBOX} width={100} height={113}>
          <path d={SIMBOLO_PATH} fill={CORES.texto} fillRule="evenodd" />
        </svg>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: 78,
              lineHeight: 1.05,
              maxWidth: 940,
            }}
          >
            {config.heroTitulo ?? "Bolsas que você carrega por anos"}
          </div>
          <div
            style={{
              fontFamily: "Karla",
              fontSize: 30,
              marginTop: 26,
              color: CORES.suave,
            }}
          >
            {`Crochê feito à mão, sob encomenda · ${config.cidade}`}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
