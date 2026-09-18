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
 *    o que obrigou a reescrever 74 linhas quando o Vercel Blob caiu.
 *
 * **O custo é baixo e previsível.** Leitura no R2 é operação Classe B, com 10
 * milhões gratuitas por mês — contra as 2.000 que estouraram na Vercel. E o
 * `next/image` guarda as versões otimizadas, então a origem é consultada uma vez
 * por tamanho, não por visita.
 *
 * **Esta rota NÃO pode ser `force-static`, e a razão é sutil.** Ela era, e fazia
 * sentido: a chave carrega sufixo aleatório, então foto nova é endereço novo e
 * não há o que invalidar. Só que `force-static` a transforma em rota ISR, e
 * **o otimizador de imagem da Vercel não otimiza imagem cuja origem é rota ISR
 * do próprio deploy** — ele devolve o arquivo original, do tamanho que estiver,
 * em qualquer largura pedida. Medido em deploy de teste: com `force-static`,
 * `w=64` voltava 640×800 com 103.877 B; sem ele, volta WebP de 1.714 B. O
 * mesmo código sempre funcionou no build local, o que faz o defeito invisível
 * fora do ar.
 *
 * Isso importa porque o painel guarda foto de até 2000px de lado. Com a rota
 * estática, cada card da home baixaria o arquivo inteiro no 4G dela.
 *
 * **Também não vale marcar `force-dynamic`** — que foi a primeira tentativa. O
 * otimizador volta a funcionar, mas a Vercel passa a tratar a rota como
 * não-cacheável e a borda dá `MISS` em toda chamada, descartando inclusive o
 * `s-maxage` que mandamos. Sem export nenhum, com a rota simplesmente dinâmica
 * por ter parâmetro, dá as duas coisas: medido no ar, o otimizador entrega WebP
 * de 1,4 kB e a rota vai de `MISS` para `HIT` na segunda chamada.
 *
 * **O cache não se perde, muda de lugar.** Antes era o cache de ISR; agora é o
 * cabeçalho da resposta, que a borda respeita, mais o cache do próprio
 * otimizador — que é quem o navegador realmente consulta (também medido: `MISS`
 * e depois `HIT`). A origem é lida uma vez por tamanho, não por visita.
 *
 * O `s-maxage` vai junto mesmo a Vercel não o repassando na resposta: ele é o
 * que uma borda qualquer lê, e o dia de precisar dele é o dia de trocar de
 * hospedagem — o mesmo raciocínio que fez esta rota existir.
 */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ chave: string[] }> }
) {
  const { chave } = await params;
  const caminho = chave.join("/");

  /**
   * **Duas barreiras, e a segunda existe porque a primeira dependia de sorte.**
   *
   * `startsWith("croche/")` sozinho passaria para `croche/../outro/x.jpg`: o
   * `fetch` normaliza o `..` e leria qualquer objeto do bucket compartilhado —
   * sem autenticação nenhuma, porque esta rota é pública. Hoje isso não
   * acontece porque o Next normaliza o caminho antes de rotear (testado: com
   * `--path-as-is` a requisição nem chega aqui), ou seja, estávamos salvos por
   * comportamento do framework e não pela guarda.
   *
   * Guarda que só funciona por causa de outra camada é guarda que some quando
   * a outra camada mudar. Recusar segmento `.` ou `..` custa uma linha.
   */
  if (chave.some((s) => s === "." || s === ".." || s.includes("/"))) {
    return new Response("Não encontrado", { status: 404 });
  }

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
      /**
       * **`nosniff`, porque estes bytes são servidos na MESMA ORIGEM do cookie
       * do painel.** O que valida o envio é `arquivo.type` — o tipo que o
       * cliente declara, não o que os bytes são. Sem `nosniff`, um arquivo com
       * HTML dentro rotulado `image/jpeg` poderia ser interpretado como página,
       * e página nesta origem enxerga a sessão dela. Hoje só quem já tem o
       * painel consegue subir, mas é exatamente o tipo de coisa que vira grave
       * no dia em que houver uma segunda usuária.
       */
      "x-content-type-options": "nosniff",
      // `s-maxage` para a borda da Vercel, `max-age` para o navegador. Um ano
      // nos dois: a chave tem sufixo aleatório, então foto nova é endereço
      // novo e não existe versão velha para expirar.
      "cache-control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
