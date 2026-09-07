import { ImageResponse } from "next/og";
import { SIMBOLO_PATH, SIMBOLO_VIEWBOX } from "@/components/brand/simbolo";
import { CORES, TAMANHO, fontesDaMarca } from "@/lib/og/fontes";
import { buscarProdutoPorSlug } from "@/lib/queries/produtos";
import { formatarPreco, formatarPrazo } from "@/lib/formatar";

/**
 * A imagem que aparece quando a Raquel manda o link da peça no WhatsApp.
 *
 * **A foto ocupa quase metade da arte, e isso é o ponto.** A primeira versão
 * era só texto sobre verde: o nome da bolsa e o preço. Quem recebe um link de
 * bolsa quer ver a bolsa — o nome não vende, a peça vende. A versão sem foto
 * existia porque, quando ela foi feita, nenhuma peça tinha foto; o catálogo
 * real só entrou depois.
 *
 * Sem foto, cai no texto sozinho ocupando a largura toda. Peça sem foto não vai
 * ao ar, mas a arte não pode quebrar por causa disso.
 */
export const alt = "Peça de crochê feita à mão";
export const size = TAMANHO;
export const contentType = "image/png";

export default async function Imagem({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [produto, fonts] = await Promise.all([
    buscarProdutoPorSlug(slug),
    fontesDaMarca(),
  ]);

  const nome = produto?.nome ?? "Crochê com Raquel";
  const categoria = produto?.subcategoria?.nome ?? produto?.categoria.nome ?? "";
  const prazo = produto ? formatarPrazo(produto.prazoMinDias, produto.prazoMaxDias) : null;
  const foto = produto?.imagens[0]?.url ?? null;

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
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg viewBox={SIMBOLO_VIEWBOX} width={62} height={70}>
              <path d={SIMBOLO_PATH} fill={CORES.texto} fillRule="evenodd" />
            </svg>
            <div style={{ fontFamily: "Karla", fontSize: 24, color: CORES.suave, letterSpacing: 2 }}>
              {categoria ? categoria.toUpperCase() : "CROCHÊ COM RAQUEL"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Fraunces",
                fontSize: nome.length > 24 ? 60 : 74,
                lineHeight: 1.05,
                color: CORES.texto,
              }}
            >
              {nome}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginTop: 22,
                fontFamily: "Karla",
                fontSize: 28,
                color: CORES.suave,
              }}
            >
              <div style={{ display: "flex" }}>
                {produto?.preco == null ? "Sob consulta" : formatarPreco(produto.preco)}
              </div>
              {prazo ? <div style={{ display: "flex" }}>{`· ${prazo}`}</div> : null}
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
