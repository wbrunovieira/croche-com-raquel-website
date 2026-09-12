/**
 * Gera a foto de exemplo das peças de demonstração.
 *
 * **Por que ela existe.** O acervo tem 8 fotos e todas já estão em uso nas 7
 * peças reais. Quatro das seis categorias estão vazias, então o site entregue à
 * Raquel não mostraria que elas existem — e ela precisa VER a estrutura para
 * entender que pode editar, excluir e criar peça nova pelo painel.
 *
 * **Por que ela diz "foto de exemplo" na cara.** Um placeholder que imita foto
 * de produto é pior que nenhum: quem olha acredita. Este é da marca (o verde, a
 * trama, o símbolo) e se anuncia — parece parte do sistema, não peça da Raquel.
 *
 * É script, e não JPEG solto no repositório, para que a próxima pessoa saiba de
 * onde o arquivo veio e possa refazê-lo:
 *
 *   node scripts/gerar-foto-exemplo.mjs
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const raiz = process.cwd();
// O símbolo sai do componente, não de uma cópia: se a marca for revetorizada, a
// foto de exemplo acompanha na próxima execução.
const fonte = readFileSync(join(raiz, "src/components/brand/simbolo.tsx"), "utf8");
const caminho = fonte.match(/export const SIMBOLO_PATH\s*=\s*\n?\s*"(.*?)";/s)[1];

const html = `<!doctype html><meta charset="utf-8"><style>
  html,body{margin:0}
  .q{width:900px;height:1200px;position:relative;background:#0C3323;
     display:grid;place-items:center;font-family:system-ui,sans-serif}
  .q::before{content:"";position:absolute;inset:0;
     background-image:
       repeating-linear-gradient( 45deg, rgba(244,238,226,.05) 0 2px, transparent 2px 14px),
       repeating-linear-gradient(-45deg, rgba(244,238,226,.05) 0 2px, transparent 2px 14px);}
  .m{position:relative;text-align:center;color:#F4EEE2}
  svg{width:260px;height:auto;opacity:.42;display:block;margin:0 auto 40px}
  .r{font-size:26px;letter-spacing:.22em;text-transform:uppercase;opacity:.75}
</style><div class="q"><div class="m">
  <svg viewBox="0 0 24 26.95"><path d="${caminho}" fill="#F4EEE2" fill-rule="evenodd"/></svg>
  <div class="r">foto de exemplo</div>
</div></div>`;

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 900, height: 1200 } });
await pagina.setContent(html);
await pagina.waitForTimeout(250);
const bytes = await pagina.screenshot({ type: "jpeg", quality: 86 });
await navegador.close();

const destino = join(raiz, "prisma/fotos/exemplo.jpg");
writeFileSync(destino, bytes);
console.log(`✓ ${destino} — ${(bytes.length / 1024).toFixed(0)} kB`);
