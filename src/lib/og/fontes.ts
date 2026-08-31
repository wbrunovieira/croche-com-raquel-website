/**
 * Fontes da marca para as imagens de compartilhamento.
 *
 * Lidos do disco, e não por `fetch(new URL(..., import.meta.url))`: esse
 * padrão só funciona no runtime Edge — no Node, `fetch` de `file:` responde
 * "not implemented". O `next.config.ts` inclui estes arquivos no rastreamento
 * para eles irem junto no deploy.
 *
 * São TTF, e não os WOFF2 que o `next/font` baixa: o gerador de imagem não lê
 * WOFF2.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const PASTA = join(process.cwd(), "src", "lib", "og");

export async function fontesDaMarca() {
  const [fraunces, karla] = await Promise.all([
    readFile(join(PASTA, "fraunces.ttf")),
    readFile(join(PASTA, "karla.ttf")),
  ]);

  return [
    { name: "Fraunces", data: fraunces, style: "normal" as const, weight: 500 as const },
    { name: "Karla", data: karla, style: "normal" as const, weight: 400 as const },
  ];
}

/** Paleta usada nas imagens — os mesmos valores da identidade. */
export const CORES = {
  fundo: "#0C3323",
  texto: "#F4EEE2",
  suave: "#C7D4C4",
  destaque: "#E8A0AE",
} as const;

export const TAMANHO = { width: 1200, height: 630 };
