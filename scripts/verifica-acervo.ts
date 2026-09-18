/**
 * O acervo dela está inteiro?
 *
 * Confere, foto por foto, três coisas ao mesmo tempo:
 *
 * 1. Todo endereço guardado no banco aponta para o armazenamento atual — nenhum
 *    sobrou apontando para o provedor antigo.
 * 2. Cada endereço LÊ de verdade. Registro que aponta para o nada é a pior
 *    forma de perda: o painel parece cheio e o site mostra buraco.
 * 3. O que está guardado tem exatamente o tamanho da cópia no backup. É esta
 *    que pega arquivo truncado — e truncado acontece: a migração para o R2 caiu
 *    no meio de um envio, com a conexão morrendo em `UND_ERR_SOCKET`.
 *
 * **Sem backup à mão, ele ainda serve** — faz 1 e 2, que não dependem de cópia
 * nenhuma, e DIZ em voz alta que a comparação de tamanho ficou de fora. Exigir
 * o backup para rodar transformaria a verificação em algo que quase nunca roda;
 * rodar calado metade do trabalho seria pior ainda, porque foi exatamente assim
 * que a verificação de compartilhamento passou semanas verde sem conferir nada.
 *
 *   pnpm check:acervo                      → procura o backup nos lugares de sempre
 *   pnpm check:acervo /caminho/do/acervo   → compara com esse
 */
import { config } from "dotenv";
import { readFile, readdir } from "node:fs/promises";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { r2Ler } from "@/lib/r2";
import { urlComSslVerificado } from "../src/lib/db-url";

config({ path: ".env.local" });

const PREFIXO = "/fotos/croche/";

/**
 * Onde um backup costuma estar nesta máquina, em ordem de preferência: a saída
 * padrão do `pnpm backup`, o repositório de backups clonado ao lado do projeto,
 * e o clone temporário que as sessões costumam usar.
 */
const LUGARES = ["backup", "../croche-com-raquel-backups/acervo", "/tmp/bk-repo/acervo"];

async function acharBackup(indicado?: string): Promise<string | null> {
  const candidatos = indicado ? [indicado] : LUGARES;
  for (const c of candidatos) {
    try {
      await readdir(`${c}/fotos`);
      return c;
    } catch {
      // segue para o próximo
    }
  }
  return null;
}

async function main() {
  const indicado = process.argv[2];

  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
  });

  const imagens = await db.productImage.findMany({ select: { url: true }, orderBy: { url: "asc" } });
  const ajustes = await db.siteSettings.findFirst({ select: { aboutImageUrl: true } });
  const enderecos = [...imagens.map((i) => i.url), ajustes?.aboutImageUrl].filter(
    (u): u is string => Boolean(u)
  );

  const acervo = await acharBackup(indicado);
  if (indicado && !acervo) {
    console.log(`✗ não achei backup em ${indicado}/fotos`);
    process.exit(1);
  }
  const arquivos = acervo ? await readdir(`${acervo}/fotos`) : null;
  if (!arquivos) {
    console.log(
      "○ sem backup à mão para comparar — conferindo só se cada foto lê inteira.\n" +
        "  Para conferir também o tamanho contra a cópia: `pnpm backup` e rode de novo,\n" +
        `  ou passe o caminho (procurei em ${LUGARES.join(", ")}).\n`
    );
  }

  const problemas: string[] = [];
  let ok = 0;

  for (const url of enderecos) {
    if (!url.startsWith(PREFIXO)) {
      problemas.push(`${url.slice(0, 70)} — não aponta para o armazenamento atual`);
      continue;
    }
    const chave = url.replace(/^\/fotos\//, "");
    const objeto = await r2Ler(chave).catch(() => null);
    if (!objeto) {
      problemas.push(`${chave} — o endereço está no banco mas a foto não lê`);
      continue;
    }
    // **Ler não basta: tem de SER foto.** Os backups de setembro de 2026
    // guardaram 22 bytes de "Your store is blocked" no lugar de cada imagem, e
    // aquilo lia perfeitamente. O que engana aqui é sempre um arquivo que
    // existe e responde.
    const bytes = Buffer.from(objeto.corpo);
    const assinatura = bytes.subarray(0, 12).toString("hex");
    const ehImagem =
      bytes.length >= 1024 &&
      (assinatura.startsWith("ffd8ff") ||
        assinatura.startsWith("89504e47") ||
        assinatura.startsWith("47494638") ||
        (assinatura.startsWith("52494646") && assinatura.slice(16, 24) === "57454250") ||
        assinatura.slice(8, 24) === "6674797061766966");
    if (!ehImagem) {
      problemas.push(`${chave} — leu ${bytes.length} byte(s) que não são imagem`);
      continue;
    }
    // O backup achata o caminho com `__`. O nome do arquivo sozinho não serve de
    // chave: `exemplo.jpg` se repete em cinco peças.
    if (!arquivos) {
      ok++;
      continue;
    }
    const nome = chave.replace(/^croche\//, "").replaceAll("/", "__");
    if (!arquivos.includes(nome)) {
      problemas.push(`${chave} — sem cópia no backup`);
      continue;
    }
    const copia = await readFile(`${acervo}/fotos/${nome}`);
    if (copia.byteLength !== objeto.corpo.byteLength) {
      problemas.push(
        `${chave} — guardado ${objeto.corpo.byteLength}B, backup ${copia.byteLength}B`
      );
      continue;
    }
    ok++;
  }

  console.log(
    arquivos
      ? `${ok}/${enderecos.length} fotos leem inteiras e batem com o backup em ${acervo}.`
      : `${ok}/${enderecos.length} fotos leem inteiras (tamanho não comparado — sem backup).`
  );
  if (problemas.length > 0) {
    console.log("");
    problemas.forEach((p) => console.log(`  ✗ ${p}`));
    console.log(`\n✗ ${problemas.length} problema(s) no acervo`);
    await db.$disconnect();
    process.exit(1);
  }
  console.log("\n✓ acervo ok");
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});