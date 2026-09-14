import type { ImageResponse } from "next/og";
import sharp from "sharp";

/**
 * Entrega a arte de compartilhamento como JPEG, e não como PNG.
 *
 * **Por que isto existe.** O `ImageResponse` do Next só emite PNG, e PNG é
 * lossless: onde há foto ele guarda cada grão. Medido nas dez peças do catálogo,
 * as artes pesavam de **528 a 976 kB**. O WhatsApp, que é o canal de venda da
 * Raquel, descarta a prévia de imagens grandes — e uma prévia sem imagem é um
 * link que não vende.
 *
 * A arte continua sendo desenhada do mesmo jeito. O que muda é a saída: o PNG
 * entra aqui e sai JPEG, no mesmo tamanho e com a mesma composição.
 *
 * **Por que não resolver reduzindo as dimensões.** 1200×630 é o que o WhatsApp,
 * o Instagram e o resto esperam; encolher a arte deixaria a foto da peça borrada
 * justamente onde ela é grande — no compartilhamento em desktop. O formato é o
 * lugar certo de economizar, porque não custa nada visível.
 *
 * A qualidade 82 é a mesma que o painel usa ao preparar as fotos: a arte não
 * fica melhor que a foto que entrou nela, e fingir o contrário só gasta bytes.
 */
export async function comoJpeg(
  arte: ImageResponse,
  cache = "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800"
): Promise<Response> {
  const png = Buffer.from(await arte.arrayBuffer());
  const jpeg = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "content-type": "image/jpeg",
      "cache-control": cache,
    },
  });
}
