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
import { fotoDeCelularFalsa } from "./lib/foto-de-teste";

config({ path: ".env.local", quiet: true });

const BASE = process.env.URL_BASE ?? "http://localhost:3000";
/**
 * A foto do teste é GERADA, e com o peso de uma de celular (~3,2 MB).
 *
 * Antes isto dependia de `FOTO_DE_TESTE=` na linha de comando, e sem a variável
 * o check não enviava foto nenhuma — foi por isso que ele passou verde enquanto
 * o painel recusava qualquer foto real: Server Action aceita 1 MB de corpo, e o
 * envio quebrava com 500 antes de a validação rodar. Agora o caminho da foto é
 * obrigatório e o tamanho é o do mundo real.
 */
const FOTO = { name: "IMG_9001.PNG", mimeType: "image/png", buffer: fotoDeCelularFalsa() };
const USUARIO = "verificacao-painel";
// Cumpre a política do painel de propósito: senha de teste fora da regra
// faria o check passar por um caminho que a Raquel nunca percorre.
const SENHA = "Verificacao#2026";
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
  await db.user.deleteMany({ where: { username: USUARIO } });
}

async function main() {
  await limpar();
  await db.user.create({
    data: { username: USUARIO, name: "Verificação", passwordHash: await gerarHashDeSenha(SENHA) },
  });

  const navegador = await chromium.launch();
  try {
    const p = await navegador.newPage({ viewport: { width: 1400, height: 1000 } });

    await p.goto(`${BASE}/admin/entrar`, { waitUntil: "networkidle" });
    await p.fill("#usuario", USUARIO);
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
    conferir("e ela nasce fora do ar", criada?.status === "DRAFT", criada?.status);

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
      "recusa colocar no ar sem foto",
      (alerta ?? "").includes("não tem foto"),
      alerta ?? "(sem alerta)"
    );

    // envia a foto
    {
      await p.setInputFiles("#arquivo", FOTO);
      // Espera mais que o normal: o navegador ainda reduz a foto antes de subir.
      await p.waitForTimeout(9000);
      const guardadas = await db.productImage.findMany({
        where: { productId: criada!.id },
        select: { url: true },
      });
      conferir("envia a foto para o Blob", guardadas.length === 1, `${guardadas.length} foto(s)`);

      /**
       * E a foto guardada é PEQUENA.
       *
       * Esta é a asserção com dentes. Só conferir que o envio funcionou não
       * pega a regressão que interessa: se alguém tirar a redução do navegador
       * (`src/lib/imagem.ts`), o envio continua passando enquanto o
       * `bodySizeLimit` do `next.config.ts` for generoso — e volta a quebrar
       * no dia em que ela escolher várias fotos, ou em produção. Aqui a
       * pergunta é direta: a foto que subiu tem tamanho de web?
       *
       * Entra uma de 3,2 MB. Reduzida, sai em algumas centenas de kB; sem
       * redução, chega inteira e este número entrega.
       */
      if (guardadas[0]) {
        const cabecalho = await fetch(guardadas[0].url, { method: "HEAD" });
        const bytes = Number(cabecalho.headers.get("content-length") ?? 0);
        conferir(
          "e a foto foi reduzida antes de subir",
          bytes > 0 && bytes < 900 * 1024,
          `${(bytes / 1024).toFixed(0)} kB (entrou com ${(FOTO.buffer.length / 1024).toFixed(0)} kB)`
        );
      }

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
