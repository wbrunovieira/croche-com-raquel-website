import { r2Ler } from "@/lib/r2";

/**
 * Serve as fotos das peças, buscando no R2 por requisição assinada.
 *
 * **Por que o site serve em vez de o armazenamento servir.** O caminho comum
 * seria o bucket público (`pub-<hash>.r2.dev`) ou um domínio próprio nele — mas
 * ligar isso é passo de painel do Cloudflare, e o token que temos não alcança a
 * API do R2. Este caminho funciona só com a credencial de objeto.
 *
 * E ele é melhor por três razões que sobrevivem à urgência que o criou:
 *
 * 1. **O endereço fica na marca dela** (`/fotos/...`), e não num domínio de
 *    provedor.
 * 2. **O identificador da conta Cloudflare não vaza** em cada `<img>` do site.
 * 3. **Se o armazenamento mudar de novo, o endereço não muda.** Foi a segunda
 *    mudança em um mês; guardar no banco um endereço de provedor foi justamente
 *    o que obrigou a reescrever 73 linhas quando o Vercel Blob caiu.
 *
 * **O custo é baixo e previsível.** Leitura no R2 é operação Classe B, com 10
 * milhões gratuitas por mês — contra as 2.000 que estouraram na Vercel. E o
 * `next/image` guarda as versões otimizadas, então a origem é consultada uma vez
 * por tamanho, não por visita.
 *
 * `force-static` com revalidação longa: a chave carrega sufixo aleatório, então
 * foto nova é endereço novo e não há o que invalidar.
 */
export const dynamic = "force-static";
export const revalidate = 31536000;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ chave: string[] }> }
) {
  const { chave } = await params;
  const caminho = chave.join("/");

  // Só o que este site guarda. Sem isto, a rota viraria um leitor genérico do
  // bucket — que é compartilhado com outros projetos.
  if (!caminho.startsWith("croche/")) {
    return new Response("Não encontrado", { status: 404 });
  }

  const arquivo = await r2Ler(caminho);
  if (!arquivo) return new Response("Não encontrado", { status: 404 });

  return new Response(arquivo.corpo, {
    headers: {
      "content-type": arquivo.tipo,
      // Declarado à mão porque **o `HEAD` não tem corpo de onde deduzir**. Sem
      // ele, quem pergunta o tamanho sem baixar recebe zero — e a verificação
      // do painel, que confere se a foto foi reduzida antes de subir, media
      // zero e passava sempre. Também poupa o navegador de descobrir o tamanho
      // baixando.
      "content-length": String(arquivo.corpo.byteLength),
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
