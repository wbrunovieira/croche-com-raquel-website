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

const TELAS = [
  "/admin",
  "/admin/produtos",
  "/admin/produtos/nova",
  "/admin/opcoes",
];

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
            .filter((h) => !rotasVivas.has(h) && !/^\/admin\/produtos\//.test(h))
        ),
      ];
      ok(`${rota} não tem link para tela removida`, mortos.length === 0, mortos.join(" · "));
    }

    // As telas removidas não podem voltar por engano — nem como link no menu.
    await p.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    const menu = await p.locator("nav a").allInnerTexts();
    ok(
      "o menu não oferece as telas removidas",
      !menu.some((i) => /Perguntas|Depoimentos|Textos do site|Categorias|Configurações/.test(i)),
      menu.map((i) => i.trim()).join(" · ")
    );
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
