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

    // A criação é de UMA etapa: tudo neste formulário, e ao fim volta para a
    // lista. Antes eram duas telas, e o check esperava cair na edição.
    await p.goto(`${BASE}/admin/produtos/nova`, { waitUntil: "networkidle" });
    await p.fill("#name", NOME_DA_PECA);
    await p.selectOption("#categoryId", { label: "Bolsas" });
    await p.fill("#description", "Descrição de verificação automática do painel.");

    // Primeiro a trava: pôr no ar sem foto tem de ser recusado ANTES de criar
    // qualquer coisa. Página publicada sem foto é pior que peça que não estreou.
    await p.selectOption("#status", "PUBLISHED");
    await p.click('button[type="submit"]');
    const alerta = await p
      .locator('form [role="alert"]')
      .first()
      .textContent({ timeout: 15000 })
      .catch(() => null);
    conferir(
      "recusa criar no ar sem foto",
      (alerta ?? "").includes("pelo menos uma foto"),
      alerta ?? "(sem alerta)"
    );
    const aindaNao = await db.product.count({ where: { name: NOME_DA_PECA } });
    conferir("e não cria nada pela metade", aindaNao === 0, `${aindaNao} peça(s)`);

    // Agora com foto, e já no ar — numa submissão só.
    {
      await p.setInputFiles('input[name="fotos"]', FOTO);
      await p.waitForSelector("form li img", { timeout: 25000 });
      // O botão fica desabilitado enquanto o navegador reduz a foto; clicar
      // antes disso não envia nada e o teste passaria sem testar.
      await p.waitForFunction(
        () => {
          const b = document.querySelector<HTMLButtonElement>('form button[type="submit"]');
          return Boolean(b && !b.disabled);
        },
        { timeout: 25000 }
      );
      conferir("mostra a prévia da foto antes de salvar", (await p.locator("form li img").count()) === 1);

      await p.click('button[type="submit"]');
      await p.waitForURL(`${BASE}/admin/produtos`, { timeout: 60000 });
      conferir("cria em uma etapa e volta para a lista", p.url().endsWith("/admin/produtos"));

      const criada = await db.product.findFirst({ where: { name: NOME_DA_PECA } });
      conferir("e ela já nasce no ar", criada?.status === "PUBLISHED", criada?.status);

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

      // e o site já mostra, sem passar por segunda tela nenhuma
      const resposta = await p.goto(`${BASE}/produtos/${criada!.slug}`, {
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
