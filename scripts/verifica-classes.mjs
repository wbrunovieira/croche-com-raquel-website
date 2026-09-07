/**
 * Verificação das classes de projeto: usadas × definidas.
 *
 * Existe porque o mesmo erro apareceu duas vezes e nenhuma outra verificação
 * pegou: `.secao--ampla` e `.secao--densa` estão definidas com DOIS traços no
 * `globals.css`, e três seções as escreviam com um só. A classe simplesmente
 * não existia — o hero e dois blocos da home rodaram sem padding vertical
 * nenhum, e nada reclamou. Classe inventada não quebra build, não quebra lint,
 * não quebra teste: ela some em silêncio, que é o pior tipo de defeito.
 *
 * O escopo é de propósito estreito: só as classes que ESTE projeto define no
 * `@layer components` do `globals.css`. Validar utilitário do Tailwind aqui
 * seria reimplementar o Tailwind e encher de falso positivo.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const CSS = "src/app/globals.css";
const RAIZ = "src";

const css = readFileSync(CSS, "utf8");

// as classes que o projeto define, dentro de @layer components
const definidas = new Set();
for (const m of css.matchAll(/^\s*\.([a-z][a-z0-9-]*)[\s,{]/gim)) definidas.add(m[1]);

// as famílias que nos interessam: prefixos de classe própria do projeto
const FAMILIAS = [...definidas]
  .map((c) => c.split("--")[0])
  .filter((c) => c.includes("-") || ["secao", "trama", "arco", "corrente"].includes(c));
const prefixos = [...new Set(FAMILIAS)];

const arquivos = [];
(function varrer(dir) {
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) varrer(p);
    else if (/\.(tsx|ts)$/.test(nome)) arquivos.push(p);
  }
})(RAIZ);

let falhas = 0;
for (const arq of arquivos) {
  const texto = readFileSync(arq, "utf8");
  for (const m of texto.matchAll(/class(?:Name)?=["'`]([^"'`]+)["'`]/g)) {
    for (const classe of m[1].split(/\s+/)) {
      const base = classe.replace(/^(?:sm|md|lg|xl|2xl|hover|focus|active|group-hover):/, "");
      if (definidas.has(base)) continue;
      // só reclama de quem PARECE ser classe do projeto: mesmo prefixo de uma
      // que existe, mas escrita de um jeito que o CSS não tem
      const candidatas = [...definidas].filter(
        (d) => d.split("--")[0] === base.split("-")[0] && d !== base
      );
      // prefere a variante com "--", que é justamente o erro que isto caça
      const parecida =
        candidatas.find((d) => d.replace("--", "-") === base) ?? candidatas[0];
      if (!parecida || !prefixos.includes(base.split("-")[0])) continue;
      const linha = texto.slice(0, m.index).split("\n").length;
      console.log(`✗ ${arq}:${linha} — "${base}" não existe. Você quis dizer "${parecida}"?`);
      falhas++;
    }
  }
}

console.log(falhas === 0 ? "\n✓ classes de projeto ok" : `\n✗ ${falhas} classe(s) inexistente(s)`);
process.exit(falhas === 0 ? 0 : 1);
