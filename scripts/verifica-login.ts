/**
 * Verificação do acesso ao painel.
 *
 * Cria uma usuária descartável, exercita o fluxo num navegador de verdade e
 * apaga a usuária no fim — inclusive se algo falhar no meio. Nenhuma conta de
 * teste fica para trás no banco.
 *
 * Precisa do servidor de pé:  pnpm dev
 * Depois:                     pnpm check:login
 */
import { chromium } from "playwright";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";
import { gerarHashDeSenha } from "../src/lib/senha";

config({ path: ".env.local", quiet: true });

const BASE = process.env.URL_BASE ?? "http://localhost:3000";
const USUARIO = "verificacao-automatica";
// Cumpre a política do painel de propósito: senha de teste fora da regra
// faria o check passar por um caminho que a Raquel nunca percorre.
const SENHA = "Verificacao#2026";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (!condicao) falhas++;
  console.log(`${condicao ? "✓" : "✗"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
}

async function main() {
  await db.user.upsert({
    where: { username: USUARIO },
    update: { name: "Verificação", passwordHash: await gerarHashDeSenha(SENHA) },
    create: { username: USUARIO, name: "Verificação", passwordHash: await gerarHashDeSenha(SENHA) },
  });

  const navegador = await chromium.launch();
  try {
    const p = await navegador.newPage({ viewport: { width: 1280, height: 900 } });

    await p.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    conferir("sem sessão, /admin manda para a entrada", p.url().includes("/admin/entrar"));

    await p.fill("#usuario", USUARIO);
    await p.fill("#senha", "senha-errada");
    await p.click('button[type="submit"]');
    await p.waitForURL("**/admin/entrar?erro=1", { timeout: 15000 }).catch(() => {});
    conferir("senha errada é recusada", p.url().includes("erro=1"), p.url());

    // `.first()`: em desenvolvimento o overlay do Next também usa role="alert".
    const alerta = await p
      .locator('[role="alert"]')
      .first()
      .textContent({ timeout: 10000 })
      .catch(() => null);
    conferir(
      "e a mensagem não revela se o usuário existe",
      (alerta ?? "").includes("Usuário ou senha incorretos"),
      alerta ?? "(não encontrada)"
    );

    await p.fill("#usuario", USUARIO);
    await p.fill("#senha", SENHA);
    await p.click('button[type="submit"]');
    await p.waitForURL("**/admin", { timeout: 15000 }).catch(() => {});
    conferir("credenciais certas entram no painel", p.url().endsWith("/admin"), p.url());
    conferir(
      "e o painel cumprimenta pelo nome",
      ((await p.locator("h1").textContent()) ?? "").includes("Verificação")
    );

    await p.click('button:has-text("Sair")');
    await p.waitForURL("**/admin/entrar**", { timeout: 15000 }).catch(() => {});
    conferir("sair devolve para a entrada", p.url().includes("/admin/entrar"), p.url());

    await p.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    conferir("e a sessão não volta sozinha", p.url().includes("/admin/entrar"));
  } finally {
    await navegador.close();
    await db.user.deleteMany({ where: { username: USUARIO } });
    await db.$disconnect();
  }
}

main()
  .then(() => {
    console.log(falhas === 0 ? "\n✓ acesso ao painel ok" : `\n✗ ${falhas} falha(s)`);
    process.exit(falhas === 0 ? 0 : 1);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
