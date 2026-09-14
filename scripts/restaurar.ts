/**
 * Restaura um backup feito por `scripts/backup.ts`.
 *
 * **Existe porque backup que ninguém sabe restaurar não é backup.** O dia de
 * descobrir como se restaura não pode ser o dia em que o catálogo sumiu — e
 * quem for restaurar talvez não seja quem escreveu isto.
 *
 * Ele repõe as linhas do banco na ordem certa (pai antes de filho) e, se
 * pedido, reenvia as fotos ao Blob nos MESMOS caminhos — é isso que faz as URLs
 * guardadas no banco voltarem a funcionar.
 *
 *   npx tsx scripts/restaurar.ts backup/                    → mostra o que faria
 *   npx tsx scripts/restaurar.ts backup/ --aplicar          → repõe o banco
 *   npx tsx scripts/restaurar.ts backup/ --aplicar --fotos  → e reenvia as fotos
 *
 * `--aplicar` sozinho não apaga nada: ele faz `upsert` por id, então repõe o que
 * sumiu e atualiza o que mudou, sem tocar no que foi criado depois do backup.
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { config as carregarEnv } from "dotenv";
import { put } from "@vercel/blob";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";

carregarEnv({ path: ".env.local", quiet: true });

const [pasta] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const APLICAR = process.argv.includes("--aplicar");
const COM_FOTOS = process.argv.includes("--fotos");

if (!pasta) {
  console.error("uso: npx tsx scripts/restaurar.ts <pasta-do-backup> [--aplicar] [--fotos]");
  process.exit(1);
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

/** Desfaz o que `serializavel()` fez no backup. */
function reviver(valor: unknown): unknown {
  if (valor === null || valor === undefined) return valor;
  if (Array.isArray(valor)) return valor.map(reviver);
  if (typeof valor === "object") {
    const o = valor as Record<string, unknown>;
    if (o.__tipo === "Date") return new Date(o.v as string);
    if (o.__tipo === "Decimal") return o.v as string;
    return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, reviver(v)]));
  }
  return valor;
}

async function main() {
  const arquivo = JSON.parse(await readFile(join(pasta, "banco.json"), "utf8"));
  console.log(`Backup de ${arquivo.geradoEm}\n`);

  for (const tabela of arquivo.ordem as string[]) {
    const linhas = (arquivo.dados[tabela] ?? []).map(reviver) as Record<string, unknown>[];
    console.log(`  ${String(linhas.length).padStart(4)} × ${tabela}`);
    if (!APLICAR) continue;

    const modelo = (db as unknown as Record<string, {
      upsert: (a: unknown) => Promise<unknown>;
    }>)[tabela];

    for (const linha of linhas) {
      // `upsert` por id: repõe o que sumiu, atualiza o que mudou, e deixa em paz
      // o que foi criado depois. Restaurar não deve apagar trabalho novo.
      await modelo.upsert({
        where: { id: linha.id },
        create: linha,
        update: linha,
      });
    }
  }

  if (COM_FOTOS && APLICAR) {
    const mapa = JSON.parse(await readFile(join(pasta, "fotos.json"), "utf8")) as Record<string, string>;
    const arquivos = new Set(await readdir(join(pasta, "fotos")));
    let n = 0;
    for (const [url, nome] of Object.entries(mapa)) {
      if (!arquivos.has(nome)) {
        console.log(`  ⚠ faltou o arquivo de ${url}`);
        continue;
      }
      const conteudo = await readFile(join(pasta, "fotos", nome));
      // O caminho é reconstruído do nome: é o que devolve a foto à MESMA URL que
      // o banco guarda. Sem `addRandomSuffix`, a URL sai idêntica.
      const caminho = nome.replace(/__/g, "/");
      await put(caminho, new Uint8Array(conteudo), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      n++;
    }
    console.log(`\n  ${n} foto(s) reenviada(s) ao armazenamento`);
  }

  if (!APLICAR) console.log("\n(nada foi alterado — rode com --aplicar)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
