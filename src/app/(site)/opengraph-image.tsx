import { ImageResponse } from "next/og";
import { SIMBOLO_PATH, SIMBOLO_VIEWBOX } from "@/components/brand/simbolo";
import { CORES, TAMANHO, fontesDaMarca } from "@/lib/og/fontes";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { listarDestaques } from "@/lib/queries/produtos";

/**
 * A imagem que aparece quando alguém compartilha o site.
 *
 * Mesma regra da imagem de peça: **a foto ocupa quase metade da arte**. A
 * primeira versão era só texto sobre verde, feita quando nenhuma peça tinha
 * foto ainda.
 *
 * A foto é a da primeira bolsa em destaque — a mesma curadoria que manda no
 * rodízio do hero, e bolsa é o carro-chefe. Sem bolsa com foto, o texto ocupa a
 * largura toda.
 */
export const alt = "Crochê com Raquel — peças de crochê feitas à mão em Petrópolis";
export const size = TAMANHO;
export const contentType = "image/png";

export default async function Imagem() {
  const [config, destaques, fonts] = await Promise.all([
    buscarConfiguracoes(),
    listarDestaques(8),
    fontesDaMarca(),
  ]);

  const foto =
    destaques.find((p) => p.ehBolsa && p.capa)?.capa?.url ??
    destaques.find((p) => p.capa)?.capa?.url ??
    null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: CORES.fundo }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
            width: foto ? 700 : 1200,
          }}
        >
          <svg viewBox={SIMBOLO_VIEWBOX} width={80} height={90}>
            <path d={SIMBOLO_PATH} fill={CORES.texto} fillRule="evenodd" />
          </svg>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Fraunces",
                fontSize: 64,
                lineHeight: 1.05,
                color: CORES.texto,
              }}
            >
              {config.heroTitulo ?? "Bolsas que você carrega por anos"}
            </div>
            <div
              style={{
                fontFamily: "Karla",
                fontSize: 27,
                marginTop: 22,
                color: CORES.suave,
              }}
            >
              {`Crochê feito à mão, sob encomenda · ${config.cidade}`}
            </div>
          </div>
        </div>

        {foto ? (
          <div style={{ display: "flex", width: 500, height: "100%" }}>
            <img src={foto} alt="" width={500} height={630} style={{ objectFit: "cover" }} />
          </div>
        ) : null}
      </div>
    ),
    { ...size, fonts }
  );
}
