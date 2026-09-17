import { r2Ler } from "@/lib/r2";

/**
 * A foto da peça, em bytes, pronta para entrar na arte de compartilhamento.
 *
 * **Por que não basta passar a URL.** O Satori (quem desenha o
 * `opengraph-image`) busca cada `<img src>` por HTTP, e desde a mudança para o
 * R2 as fotos moram em caminho RELATIVO (`/fotos/<chave>`) — que não resolve
 * fora de um navegador. O conserto óbvio seria montar a URL absoluta com
 * `urlDoSite()` e deixar o Satori buscar. Duas coisas desaconselham:
 *
 * 1. **Deploy de pré-visualização é protegido.** A Vercel exige autenticação
 *    nas URLs de preview, então o site buscando a si mesmo tomaria 401 e a arte
 *    sairia sem foto — justo onde a gente confere antes de publicar.
 * 2. É uma volta inútil: o servidor sairia para a internet, bateria na própria
 *    rota `/fotos`, que por sua vez leria do R2. Lendo aqui, é uma leitura só.
 *
 * Como o Satori aceita `data:` URI, o caminho curto é ler do R2 e embutir.
 *
 * Devolve `null` quando não há foto ou quando a leitura falha: arte sem foto é
 * pior que arte bonita, mas **página sem imagem de compartilhamento nenhuma é
 * pior ainda** — e uma falha de rede no R2 não pode derrubar a rota inteira.
 */
export async function fotoParaArte(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;

  // Endereço absoluto que sobrou (foto antiga em cache, ou de outra origem):
  // devolve como está e deixa o Satori buscar, como fazia antes.
  if (!url.startsWith("/fotos/")) return url;

  try {
    const objeto = await r2Ler(url.replace(/^\/fotos\//, ""));
    if (!objeto) return null;
    const base64 = Buffer.from(objeto.corpo).toString("base64");
    return `data:${objeto.tipo};base64,${base64}`;
  } catch {
    return null;
  }
}
