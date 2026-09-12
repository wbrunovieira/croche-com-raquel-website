/**
 * Abre todas as telas do painel e reprova se alguma não responder.
 *
 * Existe porque duas delas ficaram **quebradas com HTTP 500 sem ninguém
 * perceber**: o `check:painel` exercita só o cadastro de peça, e as outras
 * telas não eram abertas por verificação nenhuma. Erro de renderização em
 * componente de servidor não aparece em build nem em lint — só quando alguém
 * visita. Este check é esse alguém.
 *
 * Precisa do servidor de pé:  pnpm dev
 * Depois:                     pnpm check:telas
 */
import { chromium } from "playwright";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";
import { gerarHashDeSenha } from "../src/lib/senha";

config({ path: ".env.local", quiet: true });

const BASE = process.env.URL_BASE ?? "http://localhost:3000";
const USUARIO = "verificacao-telas";
const SENHA = "Verificacao#2026";

/**
 * As telas do painel.
 *
 * **Categorias voltou.** Ela tinha saído junto com "Cores e opções", e esta
 * checagem cravava que o menu tinha *exatamente* Início e Peças — o que virou
 * mentira no dia em que a Raquel precisou editar as categorias existentes para
 * escolher a capa e ajustar os textos. A checagem estava certa em falhar: ela
 * guardava uma decisão que foi revertida.
 *
 * O que NÃO volta é "Cores e opções": aquela saiu junto com os grupos de opção
 * e continua morta, rota e link. A diferença entre as duas é o motivo de a
 * lista de telas vivas e a de rotas mortas serem separadas aqui.
 */
const TELAS = [
  "/admin",
  "/admin/produtos",
  "/admin/produtos/nova",
  "/admin/categorias",
  "/admin/categorias/nova",
];

/** O que saiu de vez. Responder 200 aqui é regressão. */
const ROTAS_MORTAS = ["/admin/opcoes"];

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

let falhas = 0;
const ok = (nome: string, condicao: boolean, detalhe = "") => {
  if (!condicao) falhas++;
  console.log(`${condicao ? "✓" : "✗"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
};

async function main() {
  await db.user.upsert({
    where: { username: USUARIO },
    update: { name: "Verificação", passwordHash: await gerarHashDeSenha(SENHA) },
    create: { username: USUARIO, name: "Verificação", passwordHash: await gerarHashDeSenha(SENHA) },
  });

  const navegador = await chromium.launch();
  try {
    const p = await navegador.newPage({ viewport: { width: 1280, height: 900 } });
    const erros: string[] = [];
    p.on("pageerror", (e) => erros.push(e.message.split("\n")[0]));

    await p.goto(`${BASE}/admin/entrar`, { waitUntil: "networkidle" });
    await p.fill("#usuario", USUARIO);
    await p.fill("#senha", SENHA);
    await p.getByRole("button", { name: /^Entrar$/ }).click();
    await p.waitForURL((u) => !u.pathname.includes("/entrar"), { timeout: 30000 });

    for (const rota of TELAS) {
      erros.length = 0;
      const r = await p.goto(BASE + rota, { waitUntil: "networkidle" });
      await p.waitForTimeout(400);
      ok(
        `${rota} abre sem erro`,
        r?.status() === 200 && erros.length === 0,
        `HTTP ${r?.status()}${erros.length ? ` · ${erros[0].slice(0, 80)}` : ""}`
      );
    }

    // Nenhum link do painel pode apontar para tela que não existe mais. A tela
    // de início ficou com um atalho para `/admin/perguntas` depois que ela foi
    // removida: link morto não quebra build, lint nem tipo — só o dia da
    // Raquel.
    const rotasVivas = new Set([...TELAS, "/admin/entrar"]);
    for (const rota of TELAS) {
      await p.goto(BASE + rota, { waitUntil: "networkidle" });
      const hrefs = await p
        .locator("a[href^='/admin']")
        .evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
      const mortos = [
        ...new Set(
          hrefs
            .map((h) => h.split("?")[0]!)
            // As rotas de detalhe (`/admin/produtos/<id>`, `/admin/categorias/<id>`)
            // são dinâmicas e não cabem numa lista fixa — o que se verifica delas
            // é o prefixo, que é o que distingue "tela viva com id" de "tela que
            // não existe mais".
            .filter(
              (h) =>
                !rotasVivas.has(h) &&
                !/^\/admin\/(produtos|categorias)\//.test(h)
            )
        ),
      ];
      ok(`${rota} não tem link para tela removida`, mortos.length === 0, mortos.join(" · "));
    }

    // As telas removidas não podem voltar por engano — nem como link no menu.
    await p.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    const menu = await p.locator("nav a").allInnerTexts();
    ok(
      "o menu não oferece as telas removidas",
      !menu.some((i) =>
        /Perguntas|Depoimentos|Textos do site|Configurações|Cores e opções/.test(i)
      ),
      menu.map((i) => i.trim()).join(" · ")
    );
    ok(
      "o menu tem exatamente Início, Peças e Categorias",
      menu.map((i) => i.trim()).join(" · ") === "Início · Peças · Categorias",
      menu.map((i) => i.trim()).join(" · ")
    );

    // Rota morta não pode continuar respondendo 200 — se responder, ela voltou
    // por algum caminho que ninguém pediu. A lista é percorrida, e não escrita à
    // mão aqui, para a próxima tela removida entrar num lugar só.
    for (const rota of ROTAS_MORTAS) {
      const removida = await p.goto(`${BASE}${rota}`, { waitUntil: "domcontentloaded" });
      ok(`${rota} não existe mais`, removida?.status() === 404, `HTTP ${removida?.status()}`);
    }
  } finally {
    await navegador.close();
    await db.user.deleteMany({ where: { username: USUARIO } });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
    console.log(falhas === 0 ? "\n✓ telas do painel ok" : `\n✗ ${falhas} falha(s)`);
    process.exit(falhas === 0 ? 0 : 1);
  });
