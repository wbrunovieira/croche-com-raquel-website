import { ImageResponse } from "next/og";
import { LACO_PATH, LACO_VIEWBOX } from "@/components/brand/laco";
import { CORES, TAMANHO, fontesDaMarca } from "@/lib/og/fontes";
import { buscarProdutoPorSlug } from "@/lib/queries/produtos";
import { formatarPreco, formatarPrazo } from "@/lib/formatar";

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
  const prazo = produto
    ? formatarPrazo(produto.prazoMinDias, produto.prazoMaxDias)
    : null;
  const cores =
    produto?.grupos
      .find((g) => g.slug === "cor")
      ?.valores.map((v) => v.hex)
      .filter((h): h is string => Boolean(h))
      .slice(0, 8) ?? [];

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
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg viewBox={LACO_VIEWBOX} width={38} height={61} fill="none">
            <path
              d={LACO_PATH}
              stroke={CORES.texto}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ fontFamily: "Karla", fontSize: 24, color: CORES.suave }}>
            {categoria ? categoria.toUpperCase() : "CROCHÊ COM RAQUEL"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: nome.length > 26 ? 66 : 82,
              lineHeight: 1.05,
              maxWidth: 940,
            }}
          >
            {nome}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginTop: 28,
              fontFamily: "Karla",
              fontSize: 30,
              color: CORES.suave,
            }}
          >
            <div style={{ display: "flex" }}>
              {produto?.preco === null || produto === null
                ? "Sob consulta"
                : formatarPreco(produto.preco)}
            </div>
            {prazo ? <div style={{ display: "flex" }}>{`· ${prazo}`}</div> : null}
          </div>

          {cores.length > 0 ? (
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              {cores.map((hex) => (
                <div
                  key={hex}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    background: hex,
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
