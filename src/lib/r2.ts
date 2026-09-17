import { AwsClient } from "aws4fetch";

/**
 * As fotos das peças, no Cloudflare R2.
 *
 * **Por que saímos do Vercel Blob.** O plano gratuito dá 2.000 operações
 * avançadas por mês para a CONTA inteira, não por projeto. Em 16/09/2026 a cota
 * estourou e a Vercel suspendeu os sete armazenamentos do time de uma vez —
 * inclusive este, que tinha 22,4 MB das 74 fotos da Raquel e era o que menos
 * consumia (só grava no upload; nada por requisição). As fotos do site saíram do
 * ar e ela parou de conseguir cadastrar.
 *
 * O R2 dá 1 milhão de operações de escrita e 10 milhões de leitura por mês, e
 * saída de dados gratuita. A diferença entre 2.000 e 10.000.000 é o que tira
 * esse risco da mesa para um site cujo conteúdo É foto.
 *
 * **Uma diferença de comportamento que precisa estar escrita:** a Vercel
 * SUSPENDE quando estoura, o R2 COBRA. Foi a suspensão que nos fez descobrir o
 * problema; no R2 ele chegaria na fatura. Vale alerta de uso na conta.
 *
 * **O que este projeto tem de diferente do painel de revisão do darkfilm**, de
 * onde vem a receita: lá o servidor lê JSON com requisição assinada. Aqui o
 * NAVEGADOR precisa buscar a foto — e o bucket é privado. Então as fotos são
 * servidas pelo próprio site, em `/fotos/<chave>` (ver
 * `src/app/fotos/[...chave]/route.ts`), que lê do R2 com requisição assinada e
 * repassa os bytes. Custa uma rota e compra três coisas: o endereço é do
 * domínio dela, o id da conta Cloudflare não vaza em cada `<img>`, e a próxima
 * troca de armazenamento não mexe em nenhuma URL guardada no banco.
 *
 * Por isso `enderecoPublico` devolve caminho RELATIVO (`/fotos/…`). Onde o
 * endereço precisa ser absoluto — arte de compartilhamento e backup —, use
 * `urlAbsoluta`.
 *
 * É S3-compatível, e aqui usamos `aws4fetch` (5 KB) em vez do SDK da AWS (mais
 * de 2 MB): tudo que precisamos é assinar uma requisição.
 */

function env(nome: string): string {
  const v = process.env[nome];
  if (!v) throw new Error(`variável de ambiente ausente: ${nome}`);
  return v;
}

let cliente: AwsClient | null = null;
function aws() {
  if (!cliente) {
    cliente = new AwsClient({
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
      service: "s3",
      region: "auto",
    });
  }
  return cliente;
}

/** Há credencial configurada? Serve para o painel avisar em vez de estourar. */
export function r2Configurado(): boolean {
  return Boolean(
    process.env.R2_ENDPOINT &&
      process.env.R2_BUCKET &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY
  );
}

/**
 * O endereço que vai para o `<img>` — e é ele que fica guardado no banco.
 *
 * **É RELATIVO, e isso é decisão de durabilidade.** Guardar endereço absoluto de
 * provedor foi o que obrigou a reescrever 73 linhas do banco quando o Vercel
 * Blob caiu. Relativo funciona no localhost, no preview e no domínio sem nada
 * saber de host — e sobrevive à próxima troca de armazenamento, que a esta
 * altura é questão de quando.
 *
 * Quem precisa de endereço absoluto — a arte de compartilhamento e o backup —
 * usa `urlAbsoluta()`.
 */
export function enderecoPublico(chave: string): string {
  return `/fotos/${chave}`;
}

/**
 * O mesmo endereço, absoluto. Para onde o relativo não serve: a arte de
 * compartilhamento (o WhatsApp busca de fora) e o backup (roda fora do site).
 */
export function urlAbsoluta(url: string, base: string): string {
  return url.startsWith("/") ? `${base.replace(/\/+$/, "")}${url}` : url;
}

/**
 * Envia um arquivo e devolve o endereço público.
 *
 * O corpo vai como bytes e com `content-length` explícito porque **o R2 recusa
 * PUT sem ele** (`411 MissingContentLength`). Passando um `File` ou uma string,
 * o `fetch` do Node define o cabeçalho sozinho, mas o do runtime do Next prefere
 * `transfer-encoding: chunked` e a gravação falha — o mesmo código funciona no
 * script e quebra na aplicação. Com o tamanho em mãos, funciona nos dois.
 * (Achado da sessão do darkfilm, que tropeçou nele antes.)
 *
 * **Tenta de novo quando a conexão cai.** Enviar uma foto é uma requisição longa
 * com dois megabytes subindo, e a rede desiste no meio com alguma frequência —
 * a migração morreu assim na foto 34 de 73 (`UND_ERR_SOCKET: other side
 * closed`). Quem sobe foto aqui é a Raquel, do celular, no 4G da serra: se uma
 * queda de socket vira "não consegui salvar", ela perde o cadastro por um
 * tropeço de dez segundos. Só erro de REDE é repetido; um 4xx do R2 é resposta
 * do servidor e repetir não muda nada — sobe na hora.
 */

/** Três tentativas: a primeira e mais duas, com espera crescente entre elas. */
const TENTATIVAS = 3;

export async function r2Enviar(
  chave: string,
  // `ArrayBuffer` e não `Uint8Array`: o tipo de retorno de `.arrayBuffer()` e de
  // `readFile()` chega assim, e aceitar só ele evita a ginástica de tipos que um
  // `Uint8Array` sobre `ArrayBufferLike` exige para virar corpo de `fetch`.
  conteudo: ArrayBuffer,
  tipo: string
): Promise<string> {
  const corpo = new Uint8Array(conteudo);
  let ultimaQueda: unknown;

  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
    try {
      const r = await aws().fetch(`${env("R2_ENDPOINT")}/${env("R2_BUCKET")}/${chave}`, {
        method: "PUT",
        body: corpo,
        headers: {
          "content-type": tipo,
          "content-length": String(corpo.byteLength),
          // Um ano, imutável: a chave já carrega sufixo aleatório, então foto
          // nova é chave nova. Sem isto a borda revalidaria a cada visita e a
          // leitura gratuita viraria tráfego pago à toa.
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
      // Resposta do servidor — inclusive erro — encerra: repetir um 403 ou um
      // 411 só gastaria tempo e operação. O PUT é idempotente (mesma chave,
      // mesmo conteúdo), então repetir depois de uma QUEDA é seguro mesmo que a
      // gravação anterior tenha chegado do outro lado.
      if (!r.ok) throw new Error(`R2 PUT ${chave}: ${r.status} ${await r.text()}`);
      return enderecoPublico(chave);
    } catch (erro) {
      if (erro instanceof Error && erro.message.startsWith("R2 PUT ")) throw erro;
      ultimaQueda = erro;
      if (tentativa < TENTATIVAS) {
        await new Promise((seguir) => setTimeout(seguir, tentativa * 1500));
      }
    }
  }

  throw new Error(
    `R2 PUT ${chave}: a conexão caiu em ${TENTATIVAS} tentativas — ${
      ultimaQueda instanceof Error ? ultimaQueda.message : String(ultimaQueda)
    }`
  );
}

/**
 * Lê um objeto. Devolve null quando não existe, para o chamador tratar sem
 * `try` em volta. Usado pela rota que serve as fotos ao navegador.
 */
export async function r2Ler(
  chave: string
): Promise<{ corpo: ArrayBuffer; tipo: string } | null> {
  const r = await aws().fetch(`${env("R2_ENDPOINT")}/${env("R2_BUCKET")}/${chave}`, {
    method: "GET",
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`R2 GET ${chave}: ${r.status}`);
  return {
    corpo: await r.arrayBuffer(),
    tipo: r.headers.get("content-type") ?? "image/jpeg",
  };
}

/** Apaga um objeto. Usado só por script de limpeza — o painel não apaga foto. */
export async function r2Apagar(chave: string): Promise<void> {
  const r = await aws().fetch(`${env("R2_ENDPOINT")}/${env("R2_BUCKET")}/${chave}`, {
    method: "DELETE",
  });
  if (!r.ok && r.status !== 404) {
    throw new Error(`R2 DELETE ${chave}: ${r.status}`);
  }
}
