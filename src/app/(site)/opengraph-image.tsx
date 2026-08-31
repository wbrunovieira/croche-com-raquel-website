import { ImageResponse } from "next/og";
import { LACO_PATH, LACO_VIEWBOX } from "@/components/brand/laco";
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
        <svg viewBox={LACO_VIEWBOX} width={70} height={113} fill="none">
          <path
            d={LACO_PATH}
            stroke={CORES.texto}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
