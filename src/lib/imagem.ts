/**
 * Prepara a foto no navegador, antes de ela sair do celular da Raquel.
 *
 * **Por que no cliente e não no servidor.** Foto de celular tem 2 a 6 MB. O
 * Next aceita 1 MB de corpo num Server Action por padrão, então escolher
 * qualquer foto real no painel estourava um 500 — e estourava ANTES da
 * validação rodar, então ela via "This page couldn't load" em vez da mensagem
 * amigável. Subir o teto do servidor resolveria o erro e criaria três
 * problemas: envio lento no 4G da serra, armazenamento caro no Blob, e o site
 * servindo um PNG de 2,6 MB para quem só quer ver uma bolsa.
 *
 * Reduzindo aqui, a foto sai daqui já em tamanho de web — e a mesma passagem
 * pelo canvas devolve a miniatura da prévia de graça.
 *
 * **O lado maior é 2000px** porque é o que a lupa da página de peça precisa: a
 * foto abre em tela cheia e a pessoa aproxima para ver o ponto do crochê. Menos
 * que isso e a textura, que é o que vende a peça, some.
 *
 * **JPEG, e não WebP — e o motivo não é o site.**
 *
 * WebP economiza ~30% no mesmo olhar, e por isso era o formato daqui. Mas o
 * Satori, que desenha as imagens de compartilhamento (`opengraph-image`), **não
 * lê WebP**: ele ignora a `<img>` em silêncio e a arte sai sem a peça. Medido no
 * que estava no ar, correlação de 7 em 7 — toda peça com foto `.webp` tinha a
 * imagem de compartilhamento sem foto, e toda `.jpg` tinha. Como o painel era a
 * única porta que gerava WebP, **toda foto que a Raquel subisse produziria um
 * link sem imagem no WhatsApp** — que é o canal de venda dela.
 *
 * E a troca sai de graça para quem visita: o otimizador do Next reencoda a foto
 * por requisição, então o navegador continua recebendo WebP (conferido no ar:
 * `content-type: image/webp` nas fotos da home, com o original em JPEG). O
 * formato guardado é matéria-prima, não o que se serve.
 *
 * A queda de `toBlob` continua valendo por outro motivo: ele devolve PNG calado
 * quando não conhece o tipo pedido, e PNG de foto fica maior que o original.
 */

/** Lado maior da foto guardada. Ver o comentário do módulo. */
const LADO_MAXIMO = 2000;
const QUALIDADE = 0.82;

/**
 * Abaixo disto não vale reprocessar: recodificar uma foto que já está pequena
 * só perde qualidade, sem economizar nada que importe.
 */
const BYTES_QUE_JA_SERVEM = 600 * 1024;

export type FotoPreparada = {
  /** O arquivo que vai para o servidor — reduzido, ou o original se já servia. */
  arquivo: File;
  /** URL de objeto para a miniatura. Quem usa precisa revogar ao descartar. */
  previa: string;
  /** Bytes antes e depois, para a tela poder dizer o que fez. */
  antes: number;
  depois: number;
};

function trocarExtensao(nome: string, tipo: string) {
  const base = nome.replace(/\.[^.]+$/, "");
  return `${base}.${tipo === "image/png" ? "png" : "jpg"}`;
}

async function paraBitmap(arquivo: File) {
  // `createImageBitmap` decodifica fora da thread principal — numa foto de 12
  // megapixels isso é a diferença entre a interface travar ou não.
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(arquivo);
    } catch {
      // Safari antigo recusa alguns arquivos aqui; cai no caminho do <img>.
    }
  }
  const url = URL.createObjectURL(arquivo);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function exportar(canvas: HTMLCanvasElement): Promise<{ blob: Blob; tipo: string }> {
  return new Promise((resolver, rejeitar) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return rejeitar(new Error("O navegador não conseguiu ler a foto."));
        // `toBlob` devolve PNG calado quando não conhece o tipo pedido, e PNG de
        // foto fica MAIOR que o original — o oposto do que esta função faz. Se
        // vier PNG, o arquivo é descartado e o original segue.
        resolver({ blob, tipo: blob.type });
      },
      "image/jpeg",
      QUALIDADE
    );
  });
}

export async function prepararFoto(arquivo: File): Promise<FotoPreparada> {
  const bitmap = await paraBitmap(arquivo);
  const largura = "width" in bitmap ? bitmap.width : 0;
  const altura = "height" in bitmap ? bitmap.height : 0;
  const maior = Math.max(largura, altura);

  const jaServe = maior <= LADO_MAXIMO && arquivo.size <= BYTES_QUE_JA_SERVEM;
  if (jaServe) {
    if ("close" in bitmap) bitmap.close();
    return {
      arquivo,
      previa: URL.createObjectURL(arquivo),
      antes: arquivo.size,
      depois: arquivo.size,
    };
  }

  const escala = maior > LADO_MAXIMO ? LADO_MAXIMO / maior : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(largura * escala);
  canvas.height = Math.round(altura * escala);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("O navegador não conseguiu ler a foto.");
  // Fundo branco: se a queda para JPEG acontecer, PNG com transparência viraria
  // preto — e peça clara sobre fundo preto é o pior resultado possível aqui.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, canvas.width, canvas.height);
  if ("close" in bitmap) bitmap.close();

  const { blob, tipo } = await exportar(canvas);

  // Se a redução não economizou nada — ou se o navegador devolveu PNG em vez
  // de JPEG —, fica o original: trocar por uma recodificada só perderia
  // qualidade, e PNG de foto pesaria mais que o que entrou.
  if (blob.size >= arquivo.size || tipo === "image/png") {
    return {
      arquivo,
      previa: URL.createObjectURL(arquivo),
      antes: arquivo.size,
      depois: arquivo.size,
    };
  }

  const reduzido = new File([blob], trocarExtensao(arquivo.name, tipo), {
    type: tipo,
    lastModified: Date.now(),
  });

  return {
    arquivo: reduzido,
    previa: URL.createObjectURL(blob),
    antes: arquivo.size,
    depois: reduzido.size,
  };
}

/** "2,6 MB" — para a tela poder mostrar o que a redução fez. */
export function emMB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}
