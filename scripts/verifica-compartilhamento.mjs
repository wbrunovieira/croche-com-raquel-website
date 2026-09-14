/**
 * O que a peça leva consigo quando alguém compartilha o link.
 *
 * **A garantia que esta verificação existe para dar:** seja qual for a peça que
 * a Raquel cadastrar, o nome, a descrição e a foto dela entram no SEO da página
 * e na prévia do WhatsApp. O conteúdo é dela e muda quando ela quiser; o que não
 * pode mudar é o caminho até a prévia.
 *
 * Ela percorre TODAS as peças do sitemap, e não uma amostra: o defeito que a
 * originou aparecia em algumas e não em outras — as fotos em WebP sumiam da arte
 * e as em JPEG não, e olhar uma peça teria dado a resposta errada.
 *
 * Precisa do servidor de pé:  pnpm dev
 * Depois:                     pnpm check:compartilhar
 *
 * Contra o que está no ar, onde ela mais importa:
 *   URL_BASE=https://preview.crochecomraquel.com.br pnpm check:compartilhar
 */
import sharp from "sharp";

const BASE = process.env.URL_BASE ?? "http://localhost:3000";

/**
 * O teto de peso da arte.
 *
 * O WhatsApp descarta a prévia de imagens grandes, e prévia sem imagem é link
 * que não vende. 300 kB é o número que se cita; o teto aqui é mais apertado de
 * propósito — depois que a arte passou a sair em JPEG, a maior do catálogo tem
 * 101 kB, e um teto perto do real é o que faz uma regressão aparecer no dia em
 * que acontece, e não meses depois.
 */
const TETO_KB = 200;

/**
 * Entropia mínima para a arte conter uma foto.
 *
 * Arte com peça tem milhares de cores; arte só de texto e marca tem centenas.
 * Medido: 493 cores distintas sem foto contra 76.480 com. A entropia separa as
 * duas sem depender do peso, que muda com o formato e com a compressão.
 */
const ENTROPIA_COM_FOTO = 4;

let falhas = 0;
const ok = (nome, condicao, detalhe = "") => {
  if (!condicao) falhas++;
  console.log(`${condicao ? "✓" : "✗"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
};

const texto = async (url) => (await fetch(url)).text();
const pegar = (html, re) => (html.match(re) ?? [])[1] ?? "";

const mapa = await texto(`${BASE}/sitemap.xml`);
const slugs = [...mapa.matchAll(/produtos\/([a-z0-9-]+)</g)].map((m) => m[1]);

if (slugs.length === 0) {
  console.log("✗ nenhuma peça no sitemap — não há o que verificar");
  process.exit(1);
}

console.log(`Conferindo ${slugs.length} peça(s).\n`);

for (const slug of slugs) {
  const html = await texto(`${BASE}/produtos/${slug}`);

  const titulo = pegar(html, /<title>([^<]*)/);
  const descricao = pegar(html, /name="description" content="([^"]*)/);
  const ogTitulo = pegar(html, /og:title" content="([^"]*)/);
  const ogDescricao = pegar(html, /og:description" content="([^"]*)/);
  const ogImagem = pegar(html, /og:image" content="([^"]+)/);
  // O nome da peça é o `<h1>` — é a fonte da verdade na página, e é contra ele
  // que o resto tem de bater.
  const nome = pegar(html, /<h1[^>]*>([^<]+)/).trim();
  // A peça tem foto? O Blob é a única origem de foto de peça.
  const temFoto = /blob\.vercel-storage\.com/.test(html);

  const prefixo = `${slug}:`;
  ok(`${prefixo} o título leva o nome da peça`, nome !== "" && titulo.includes(nome), titulo.slice(0, 60));
  ok(`${prefixo} tem descrição`, descricao.length >= 20, `${descricao.length} caracteres`);
  ok(`${prefixo} o og:title leva o nome`, ogTitulo.includes(nome));
  ok(`${prefixo} o og:description acompanha a descrição`, ogDescricao.slice(0, 40) === descricao.slice(0, 40));

  if (!ogImagem) {
    ok(`${prefixo} declara og:image`, false, "ausente");
    continue;
  }

  const resposta = await fetch(ogImagem.replace(/^https?:\/\/[^/]+/, BASE));
  const tipo = resposta.headers.get("content-type") ?? "";
  const bytes = Buffer.from(await resposta.arrayBuffer());
  const kb = Math.round(bytes.length / 1024);

  ok(`${prefixo} a arte é imagem de verdade`, tipo.startsWith("image/"), tipo);
  ok(`${prefixo} cabe na prévia do WhatsApp`, kb <= TETO_KB, `${kb} kB (teto ${TETO_KB})`);

  if (tipo.startsWith("image/")) {
    const { entropy } = await sharp(bytes).stats();
    const { width, height } = await sharp(bytes).metadata();
    ok(`${prefixo} a arte tem 1200×630`, width === 1200 && height === 630, `${width}×${height}`);
    if (temFoto) {
      ok(
        `${prefixo} a foto da peça está na arte`,
        entropy >= ENTROPIA_COM_FOTO,
        `entropia ${entropy.toFixed(2)} (mínimo ${ENTROPIA_COM_FOTO})`
      );
    }
  }
}

console.log(falhas === 0 ? "\n✓ compartilhamento ok" : `\n✗ ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
