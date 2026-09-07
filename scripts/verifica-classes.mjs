/**
 * Verifica que toda classe escrita num `className` existe de verdade.
 *
 * Existe por um erro específico, que já aconteceu três vezes: **`.secao--ampla`
 * e `.secao--densa` têm DOIS traços.** Escritas com um só (`secao-ampla`), elas
 * não são classe nenhuma — o CSS não tem a regra, o Tailwind não gera nada, o
 * navegador ignora em silêncio e a seção simplesmente roda sem padding
 * vertical. Nada quebra, nada avisa; só fica errado.
 *
 * São duas passagens, e a segunda depende de um build:
 *
 * 1. **Sempre** — classe de projeto inventada. Colhe as classes escritas à mão
 *    no `globals.css` e reprova todo token que COMEÇA com uma delas sem ser
 *    exatamente uma delas. É o que pega `secao-densa`, `corrente-claro`,
 *    `revelar-texto`, `container-site-texto`.
 *
 * 2. **Depois de `pnpm build`** — utilitário inventado. Compara cada token com
 *    os seletores realmente presentes no CSS de produção. É o que pega
 *    `bg-inv-fundoo`, `mt-respiiro`, `text-t9` e qualquer outro token que o
 *    Tailwind leu, não entendeu e descartou calado. Sem build não dá para
 *    saber, então a passagem avisa e se cala — nunca reprova por falta de
 *    build.
 *
 * Uso:  pnpm check:classes        (rode depois de `pnpm build` para a passagem 2)
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const CSS_FONTE = join(RAIZ, "src/app/globals.css");

/**
 * Classes que existem sem virar regra de CSS: são marcadores lidos por
 * variantes (`group-open:`, `peer-checked:`) e nunca geram seletor próprio.
 */
const MARCADORES = new Set(["group", "peer"]);

/**
 * Marca onde uma interpolação partiu um nome de classe ao meio.
 *
 * Não é espaço de propósito: ela precisa ficar GRUDADA no pedaço vizinho, para
 * que `revelar--${entrada}` seja descartado inteiro em vez de virar a classe
 * inexistente "revelar--". E é um caractere que jamais aparece num nome de
 * classe, senão marcaria token legítimo.
 */
const EMENDA = "\u0000";

function arquivos(dir, extensao, achados = []) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      if (nome === "node_modules" || nome === "generated") continue;
      arquivos(caminho, extensao, achados);
    } else if (nome.endsWith(extensao)) {
      achados.push(caminho);
    }
  }
  return achados;
}

/**
 * Colhe o conteúdo de toda string literal de uma expressão JS, em qualquer
 * profundidade: aspas, apóstrofo e template literal — e, dentro do template,
 * também as strings que moram nas interpolações (`${ativa ? "a" : "b"}`), que
 * é onde metade das classes condicionais do projeto vive.
 *
 * Duas exceções, e as duas existem porque um check que grita lobo é um check
 * que ninguém lê:
 *
 * - **String comparada não é classe.** Em `entrada === "fio" ? "" : …` o "fio"
 *   é o nome de um gesto de entrada, não um utilitário.
 * - **Argumento de chamada não é classe.** Em `classesDeBotao("secundaria")` a
 *   string é o nome de uma variante; quem monta a classe é a função.
 */
function stringsDaExpressao(corpo, saida = []) {
  // Profundidade de chamada de função: enquanto for > 0, o que aparece é
  // argumento, não lista de classes.
  const pilhaDeParenteses = [];
  let emChamada = 0;

  for (let i = 0; i < corpo.length; i++) {
    const c = corpo[i];

    if (c === "(") {
      const chamada = /[A-Za-z0-9_$\]]\s*$/.test(corpo.slice(0, i));
      pilhaDeParenteses.push(chamada);
      if (chamada) emChamada++;
      continue;
    }
    if (c === ")") {
      if (pilhaDeParenteses.pop()) emChamada--;
      continue;
    }

    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < corpo.length && corpo[j] !== c) j += corpo[j] === "\\" ? 2 : 1;
      const comparada =
        /[=!]==?\s*$/.test(corpo.slice(0, i)) || /^\s*[=!]==?/.test(corpo.slice(j + 1));
      if (!comparada && emChamada === 0) saida.push(corpo.slice(i + 1, j));
      i = j;
      continue;
    }

    if (c === "`") {
      let j = i + 1;
      let texto = "";
      while (j < corpo.length && corpo[j] !== "`") {
        if (corpo[j] === "\\") {
          j += 2;
          continue;
        }
        if (corpo[j] === "$" && corpo[j + 1] === "{") {
          let nivel = 0;
          let k = j + 1;
          for (; k < corpo.length; k++) {
            if (corpo[k] === "{") nivel++;
            else if (corpo[k] === "}" && --nivel === 0) break;
          }
          stringsDaExpressao(corpo.slice(j + 2, k), saida);
          texto += EMENDA;
          j = k + 1;
          continue;
        }
        texto += corpo[j];
        j++;
      }
      saida.push(texto);
      i = j;
    }
  }

  return saida;
}

/**
 * Extrai os tokens de todo `className` do arquivo. Não é um parser de JSX, e
 * não precisa ser: interessa achar as strings literais que viram classe.
 */
function classesDoArquivo(fonte) {
  const tokens = new Set();
  const marca = /className\s*=\s*/g;

  while (marca.exec(fonte) !== null) {
    const i = marca.lastIndex;
    const trechos = [];

    if (fonte[i] === '"' || fonte[i] === "'") {
      const aspa = fonte[i];
      const fim = fonte.indexOf(aspa, i + 1);
      if (fim === -1) continue;
      trechos.push(fonte.slice(i + 1, fim));
    } else if (fonte[i] === "{") {
      let nivel = 0;
      let j = i;
      for (; j < fonte.length; j++) {
        if (fonte[j] === "{") nivel++;
        else if (fonte[j] === "}" && --nivel === 0) break;
      }
      stringsDaExpressao(fonte.slice(i + 1, j), trechos);
    } else {
      continue;
    }

    for (const trecho of trechos) {
      for (const bruto of trecho.split(/\s+/)) {
        const token = bruto.trim();
        if (token && !token.includes(EMENDA)) tokens.add(token);
      }
    }
  }

  return tokens;
}

/** Classes escritas à mão no `globals.css` (as do projeto, não as do Tailwind). */
function classesDefinidas(css) {
  const definidas = new Set();
  // Só posições de seletor: `.nome` seguido do que pode vir depois de um
  // seletor. Descarta o `.05` de `rgba(…,.05)`, que começa com dígito.
  for (const m of css.matchAll(/\.([a-zA-Z][A-Za-z0-9_-]*)(?=[\s,{:>~+.[)]|$)/gm)) {
    definidas.add(m[1]);
  }
  return definidas;
}

/** Seletores de classe presentes no CSS gerado, já sem as barras de escape. */
function classesGeradas(css) {
  const geradas = new Set();
  for (const m of css.matchAll(/\.((?:\\.|[A-Za-z0-9_-])+)/g)) {
    geradas.add(m[1].replace(/\\(.)/g, "$1"));
  }
  return geradas;
}

// ---------------------------------------------------------------- passagem 1

const css = readFileSync(CSS_FONTE, "utf8");
const definidas = classesDefinidas(css);
const fontes = arquivos(join(RAIZ, "src"), ".tsx");

const usadas = new Map(); // token -> arquivos onde aparece
for (const arquivo of fontes) {
  for (const token of classesDoArquivo(readFileSync(arquivo, "utf8"))) {
    if (!usadas.has(token)) usadas.set(token, new Set());
    usadas.get(token).add(arquivo.replace(RAIZ + "/", ""));
  }
}

let falhou = 0;

for (const [token, onde] of usadas) {
  if (definidas.has(token)) continue;
  // Um token que começa com o nome de uma classe do projeto, sem ser ela, é
  // quase sempre a mesma classe escrita errado.
  const parecida = [...definidas].find(
    (d) => token.startsWith(d) && d.length > 3 && !MARCADORES.has(d)
  );
  if (!parecida) continue;
  falhou = 1;
  console.log(`✗ classe de projeto inexistente: "${token}" — existe "${parecida}"`);
  for (const arquivo of onde) console.log(`    ${arquivo}`);
}

// ---------------------------------------------------------------- passagem 2

// `BUILD_ID` só existe depois de `next build`. O `next dev` escreve em
// `.next/dev`, com o CSS partido por rota e sem garantia de estar completo —
// conferir contra ele acusaria falha em classe que existe.
const dirBuild = join(RAIZ, ".next/static");
const cssGerado =
  existsSync(join(RAIZ, ".next/BUILD_ID")) && existsSync(dirBuild)
    ? arquivos(dirBuild, ".css")
        .map((c) => readFileSync(c, "utf8"))
        .join("\n")
    : "";

if (!cssGerado) {
  console.log("○ sem CSS de produção em .next — a segunda passagem exige `pnpm build`");
} else {
  const geradas = classesGeradas(cssGerado);
  for (const [token, onde] of usadas) {
    if (geradas.has(token) || MARCADORES.has(token)) continue;
    falhou = 1;
    console.log(`✗ classe sem regra no CSS gerado: "${token}"`);
    for (const arquivo of onde) console.log(`    ${arquivo}`);
  }
}

console.log(
  falhou === 0
    ? `✓ ${usadas.size} classes conferidas, todas existem`
    : "✗ classe inventada — ver o globals.css e docs/sistema-de-espacamento.md §8.4"
);
process.exit(falhou);
