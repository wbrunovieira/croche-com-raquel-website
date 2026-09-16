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
 * NAVEGADOR precisa buscar a foto — então o bucket serve por um endereço
 * público, e a assinatura só entra na escrita. Por isso existem duas funções e
 * não uma: `enderecoPublico` monta o que vai para o `<img>`, e `r2Enviar` fala
 * com a API.
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
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_URL_PUBLICA
  );
}

/**
 * O endereço que vai para o `<img>` — e é ele que fica guardado no banco.
 *
 * Sai do `R2_URL_PUBLICA` e não do endpoint da API: o endpoint exige assinatura
 * e expira, o público é servido pela borda do Cloudflare e cacheia. Guardar o
 * endereço assinado no banco daria uma foto que funciona hoje e quebra amanhã.
 */
export function enderecoPublico(chave: string): string {
  return `${env("R2_URL_PUBLICA").replace(/\/+$/, "")}/${chave}`;
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
 */
export async function r2Enviar(
  chave: string,
  // `ArrayBuffer` e não `Uint8Array`: o tipo de retorno de `.arrayBuffer()` e de
  // `readFile()` chega assim, e aceitar só ele evita a ginástica de tipos que um
  // `Uint8Array` sobre `ArrayBufferLike` exige para virar corpo de `fetch`.
  conteudo: ArrayBuffer,
  tipo: string
): Promise<string> {
  const corpo = new Uint8Array(conteudo);
  const r = await aws().fetch(`${env("R2_ENDPOINT")}/${env("R2_BUCKET")}/${chave}`, {
    method: "PUT",
    body: corpo,
    headers: {
      "content-type": tipo,
      "content-length": String(corpo.byteLength),
      // Um ano, imutável: a chave já carrega sufixo aleatório, então foto nova
      // é chave nova. Sem isto a borda revalidaria a cada visita e a leitura
      // gratuita viraria tráfego pago à toa.
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
  if (!r.ok) throw new Error(`R2 PUT ${chave}: ${r.status} ${await r.text()}`);
  return enderecoPublico(chave);
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
