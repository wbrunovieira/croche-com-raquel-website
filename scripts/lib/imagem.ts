/**
 * Isto é foto mesmo?
 *
 * **A pergunta nasceu de um estrago.** Entre 14 e 17/09/2026 o backup gravou, no
 * lugar de cada uma das 74 fotos, um arquivo de 22 bytes com o texto `Your store
 * is blocked` — o corpo de erro do Vercel Blob suspenso, que vinha com **HTTP
 * 200**. Nada reclamou: o acervo inteiro foi sobrescrito por mensagens de erro e
 * commitado, e o histórico ficou com cara de saudável.
 *
 * A lição é que **status 200 não é promessa de conteúdo**. O que desce precisa
 * COMEÇAR como imagem e ter tamanho de foto — um corpo de erro não passa por
 * nenhuma das duas.
 *
 * Mora aqui, e não em cada script, porque a checagem precisa valer nas TRÊS
 * pontas que movem foto: o backup que baixa, o restaurador que sobe e a
 * verificação que confere. Ela já existia em duas e faltava justo na terceira —
 * a que sobe. Um backup ruim daquela janela reenviaria os 22 bytes por cima das
 * fotos boas, transformando backup ruim em perda real.
 */

/** Menor que isto não é foto de peça; é recado de servidor. */
const MINIMO_DE_FOTO = 1024;

export function ehImagem(bytes: Buffer | Uint8Array): boolean {
  if (bytes.length < MINIMO_DE_FOTO) return false;
  const cabeca = Buffer.from(bytes.subarray(0, 12)).toString("hex");
  return (
    cabeca.startsWith("ffd8ff") || // JPEG
    cabeca.startsWith("89504e47") || // PNG
    cabeca.startsWith("47494638") || // GIF
    (cabeca.startsWith("52494646") && cabeca.slice(16, 24) === "57454250") || // RIFF…WEBP
    cabeca.slice(8, 24) === "6674797061766966" // ftypavif
  );
}

/**
 * O caminho no armazenamento a partir do nome que o backup gravou em disco.
 *
 * O backup achata `croche/produtos/<slug>/<arquivo>` em
 * `produtos__<slug>__<arquivo>`: tira o prefixo do bucket (que não distingue
 * nada entre si) e troca as barras. Desfazer isso é o que devolve a foto à
 * MESMA chave que o banco guarda — e é exatamente o passo que o restaurador
 * errava, montando `produtos/<slug>/<arquivo>` sem o `croche/` e mandando a foto
 * para um lugar que nenhuma URL do banco aponta.
 */
export function chaveDoArquivoDeBackup(nome: string): string {
  return `croche/${nome.replace(/__/g, "/")}`;
}
