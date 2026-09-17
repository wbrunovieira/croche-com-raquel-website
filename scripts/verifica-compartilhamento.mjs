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
let comFoto = 0;
const ok = (nome, condicao, detalhe = "") => {
  if (!condicao) falhas++;
  console.log(`${condicao ? "✓" : "✗"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
};

const texto = async (url) => (await fetch(url)).text();
const pegar = (html, re) => (html.match(re) ?? [])[1] ?? "";

/**
 * **A obra atende no domínio raiz, e ali não há o que conferir.**
 *
 * Enquanto o lançamento não acontece, `crochecomraquel.com.br` serve a página
 * de "em breve" em TODA rota — inclusive `/produtos/<slug>`, que responde 200
 * com a obra em vez da peça. O sitemap, porém, lista as peças normalmente.
 *
 * Sem esta parada, a verificação percorria dezenas de páginas de obra, não
 * achava foto em nenhuma e acusava *"o detector de foto parou de casar"* — um
 * alarme falso apontando para o lugar errado. Alarme falso ensina a ignorar
 * alarme, então aqui ela diz o que está acontecendo e sai sem fingir que
 * conferiu algo.
 */
const inicial = await texto(`${BASE}/`);
if (/— em breve/.test(inicial)) {
  console.log(
    `○ ${BASE} está servindo a página de obra — nenhuma peça para conferir.\n` +
      "  Aponte para onde o site atende de verdade:\n" +
      "  URL_BASE=https://preview.crochecomraquel.com.br pnpm check:compartilhar"
  );
  process.exit(0);
}

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
  /**
   * A peça tem foto?
   *
   * **Esta linha já apodreceu uma vez.** Ela procurava `blob.vercel-storage.com`
   * — o endereço do armazenamento de então. Quando as fotos migraram para o R2,
   * o padrão parou de casar, `temFoto` virou `false` em todas as peças e a
   * asserção mais importante daqui — "a foto da peça está na arte" — **deixou de
   * rodar sem dizer nada**. O teste seguia verde medindo peso e dimensão de uma
   * arte que podia estar vazia.
   *
   * Agora ela procura `/fotos/`, que é rota DESTE site e não endereço de
   * fornecedor. A rota existe justamente para sobreviver à próxima troca de
   * armazenamento (ver `src/app/fotos/[...chave]/route.ts`), então o detector
   * herda essa durabilidade. As duas formas aparecem no HTML: crua nos
   * `preload`, e escapada dentro do `src` que o `next/image` monta.
   */
  const temFoto = /\/fotos\/|%2Ffotos%2F/.test(html);

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
      comFoto++;
      ok(
        `${prefixo} a foto da peça está na arte`,
        entropy >= ENTROPIA_COM_FOTO,
        `entropia ${entropy.toFixed(2)} (mínimo ${ENTROPIA_COM_FOTO})`
      );
    }
  }
}

/**
 * **Nenhuma peça com foto reprova o teste inteiro.**
 *
 * É a trava contra o defeito que já aconteceu: o detector de foto ficar
 * desatualizado, todas as asserções de foto serem puladas, e a verificação
 * continuar verde. Um catálogo em que nenhuma peça tem foto ou é um catálogo
 * quebrado ou é um detector quebrado — nos dois casos alguém precisa olhar.
 */
if (comFoto === 0) {
  console.log(
    "\n✗ nenhuma peça foi detectada com foto — ou o catálogo está sem fotos, " +
      "ou o detector de foto parou de casar com o HTML (já aconteceu: ver o " +
      "comentário de `temFoto`)."
  );
  falhas++;
}

console.log(falhas === 0 ? "\n✓ compartilhamento ok" : `\n✗ ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
