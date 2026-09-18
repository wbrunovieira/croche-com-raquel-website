/**
 * A escala de espaçamento — ver `docs/sistema-de-espacamento.md` §8.3.
 *
 * **Era uma lista NEGRA, e por isso passava mentindo.** A versão anterior
 * enumerava os degraus proibidos (7, 9, 11, 13, …). Quem escrevesse `gap-1.5`
 * ou `py-2.5` passava verde: fracionário não estava na lista, e a §1.3 proíbe
 * qualquer fracionário que não seja `0.5`. Havia **sete violações na árvore** no
 * dia em que isto foi reescrito, com a verificação dizendo "dentro da escala".
 *
 * Lista negra envelhece — cada degrau novo do Tailwind precisa ser lembrado
 * aqui. Lista BRANCA não: a escala é fechada em quinze degraus, e tudo que não
 * estiver nela reprova, inclusive o que ainda não foi inventado.
 *
 * **E saiu do bash.** A primeira tentativa usava `grep -P` para o lookahead; o
 * grep do macOS não tem `-P`, falhava, e o script **imprimia ✓ assim mesmo** —
 * o mesmo defeito que ele existe para consertar, dentro do próprio conserto.
 * Em Node não há ferramenta externa para falhar em silêncio.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/** A escala fechada, de `docs/sistema-de-espacamento.md` §1.3. */
const ESCALA = new Set([
  "0", "0.5", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "32",
  "px", "auto", "full",
]);

const PREFIXOS =
  "p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y";

/** Casa `gap-1.5`, `py-2.5`, `mt-7`, e também o arbitrário `p-[3px]`. */
const USO = new RegExp(`\\b(?:${PREFIXOS})-(\\[[^\\]]*\\]|[0-9][0-9.]*|px|auto|full)`, "g");

/**
 * `src/components/brand` fica de fora: o lockup do logotipo usa medidas em `em`
 * (0.42em, 1.28em, 0.06em) que são relações tipográficas e precisam escalar com
 * o corpo da assinatura. Prendê-las à escala quebraria o logo em qualquer
 * tamanho diferente do atual. Ver `identidade-visual.md` §6.5.
 */
const FORA = ["brand", "generated", "node_modules", ".next"];

function arquivos(dir) {
  const achados = [];
  for (const nome of readdirSync(dir)) {
    if (FORA.includes(nome)) continue;
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) achados.push(...arquivos(caminho));
    else if (/\.tsx?$/.test(nome)) achados.push(caminho);
  }
  return achados;
}

let falhas = 0;
let conferidos = 0;

for (const caminho of arquivos("src")) {
  const linhas = readFileSync(caminho, "utf8").split("\n");
  linhas.forEach((linha, i) => {
    for (const [inteiro, valor] of linha.matchAll(USO)) {
      conferidos++;
      if (valor.startsWith("[")) {
        console.log(`✗ ${caminho}:${i + 1}  ${inteiro} — valor arbitrário proibido (§7.1)`);
        falhas++;
      } else if (!ESCALA.has(valor)) {
        console.log(`✗ ${caminho}:${i + 1}  ${inteiro} — fora da escala (§1.3)`);
        falhas++;
      }
    }
  });
}

if (falhas > 0) {
  console.log(`\n✗ ${falhas} uso(s) fora da escala, de ${conferidos} conferido(s)`);
  console.log("  A escala é: 0 0.5 1 2 3 4 5 6 8 10 12 16 20 24 32");
  process.exit(1);
}
console.log(`✓ Espaçamento dentro da escala — ${conferidos} usos conferidos`);
