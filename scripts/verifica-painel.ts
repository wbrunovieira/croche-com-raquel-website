/**
 * Verificação do painel: cria uma usuária descartável, exercita o caminho
 * completo de cadastrar uma peça — incluindo envio de foto para o Blob — e
 * limpa tudo no fim, inclusive se falhar no meio.
 *
 * Precisa do servidor de pé:  pnpm dev
 * Depois:                     pnpm check:painel
 */
import { chromium } from "playwright";
import { config } from "dotenv";
import { del } from "@vercel/blob";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";
import { gerarHashDeSenha } from "../src/lib/senha";

config({ path: ".env.local", quiet: true });

const BASE = process.env.URL_BASE ?? "http://localhost:3000";
const FOTO = process.env.FOTO_DE_TESTE;
const EMAIL = "verificacao-painel@exemplo.invalid";
const SENHA = "senha-descartavel-da-verificacao";
const NOME_DA_PECA = "Peça de verificação automática";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (!condicao) falhas++;
  console.log(`${condicao ? "✓" : "✗"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
}

async function limpar() {
  const pecas = await db.product.findMany({
    where: { name: { startsWith: NOME_DA_PECA } },
    select: { id: true, images: { select: { url: true } } },
  });
  for (const p of pecas) {
    await Promise.allSettled(p.images.map((i) => del(i.url)));
  }
  await db.product.deleteMany({ where: { name: { startsWith: NOME_DA_PECA } } });
  await db.user.deleteMany({ where: { email: EMAIL } });
}

async function main() {
  await limpar();
  await db.user.create({
    data: { email: EMAIL, name: "Verificação", passwordHash: await gerarHashDeSenha(SENHA) },
  });

  const navegador = await chromium.launch();
  try {
    const p = await navegador.newPage({ viewport: { width: 1400, height: 1000 } });

    await p.goto(`${BASE}/admin/entrar`, { waitUntil: "networkidle" });
    await p.fill("#email", EMAIL);
    await p.fill("#senha", SENHA);
    await p.click('button[type="submit"]');
    await p.waitForURL("**/admin", { timeout: 20000 });

    // cria a peça
    await p.goto(`${BASE}/admin/produtos/nova`, { waitUntil: "networkidle" });
    await p.fill("#name", NOME_DA_PECA);
    await p.selectOption("#categoryId", { label: "Bolsas" });
    await p.click('button[type="submit"]');
    // O padrão exige um id de verdade: `[a-z0-9]+` casaria com a própria
    // página /admin/produtos/nova e o wait resolveria antes de criar nada.
    await p.waitForURL(/\/admin\/produtos\/c[a-z0-9]{15,}$/, { timeout: 20000 });
    conferir("cria a peça e abre a edição", /\/produtos\/c[a-z0-9]{15,}$/.test(p.url()));

    const criada = await db.product.findFirst({ where: { name: NOME_DA_PECA } });
    conferir("e ela nasce como rascunho", criada?.status === "DRAFT", criada?.status);

    // tenta publicar sem foto
    await p.fill("#description", "Descrição de verificação automática do painel.");
    await p.selectOption("#status", "PUBLISHED");
    await p.click('button:has-text("Salvar")');
    const alerta = await p
      .locator('form [role="alert"]')
      .first()
      .textContent({ timeout: 15000 })
      .catch(() => null);
    conferir(
      "recusa publicar sem foto",
      (alerta ?? "").includes("não tem foto"),
      alerta ?? "(sem alerta)"
    );

    // envia a foto
    if (FOTO) {
      await p.setInputFiles("#arquivo", FOTO);
      await p.waitForTimeout(6000);
      const comFoto = await db.productImage.count({ where: { productId: criada!.id } });
      conferir("envia a foto para o Blob", comFoto === 1, `${comFoto} foto(s)`);

      // Agora publica. A descrição precisa ser digitada de novo: a tentativa
      // anterior foi recusada por falta de foto, então nada foi salvo, e o
      // reload devolve o formulário como estava no banco.
      await p.reload({ waitUntil: "networkidle" });
      await p.fill("#description", "Descrição de verificação automática do painel.");
      await p.selectOption("#status", "PUBLISHED");
      await p.click('button:has-text("Salvar")');
      await p.waitForTimeout(3000);
      const publicada = await db.product.findUnique({ where: { id: criada!.id } });
      conferir("publica depois que a foto existe", publicada?.status === "PUBLISHED", publicada?.status);

      // e o site já mostra
      const resposta = await p.goto(`${BASE}/produtos/${publicada!.slug}`, {
        waitUntil: "networkidle",
      });
      conferir("e a peça aparece no site", resposta?.status() === 200, `status ${resposta?.status()}`);
    }
  } finally {
    await navegador.close();
    await limpar();
    await db.$disconnect();
  }
}

main()
  .then(() => {
    console.log(falhas === 0 ? "\n✓ painel ok" : `\n✗ ${falhas} falha(s)`);
    process.exit(falhas === 0 ? 0 : 1);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
