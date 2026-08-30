/**
 * Cria (ou atualiza) o usuário do painel.
 *
 *   pnpm admin:criar "Raquel Boaventura" raquel@exemplo.com
 *
 * A senha NÃO vai na linha de comando: ela seria gravada no histórico do shell.
 * O script pede a senha e a lê com o eco desligado.
 */
import { stdin, stdout } from "node:process";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";
import { gerarHashDeSenha } from "../src/lib/senha";

config({ path: ".env.local", quiet: true });

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

/**
 * Lê a senha sem ecoar. Em vez de trocar o `write` do stdout — que é frágil e
 * vaza se algo mais escrever no terminal no meio — o terminal entra em modo
 * bruto e os caracteres são lidos um a um.
 */
function perguntarSenha(rotulo: string): Promise<string> {
  return new Promise((resolver, rejeitar) => {
    if (!stdin.isTTY) {
      rejeitar(new Error("Rode este comando num terminal: a senha é digitada."));
      return;
    }

    stdout.write(rotulo);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let senha = "";
    const aoReceber = (pedaco: string) => {
      for (const caractere of pedaco) {
        switch (caractere) {
          case "\n":
          case "\r":
          case "\u0004": // Ctrl-D
            stdin.setRawMode(false);
            stdin.pause();
            stdin.off("data", aoReceber);
            stdout.write("\n");
            resolver(senha);
            return;
          case "\u0003": // Ctrl-C
            stdin.setRawMode(false);
            stdout.write("\n");
            process.exit(130);
            return;
          case "\u007f": // backspace
          case "\b":
            senha = senha.slice(0, -1);
            break;
          default:
            // Ignora sequências de controle (setas, por exemplo).
            if (caractere >= " ") senha += caractere;
        }
      }
    };

    stdin.on("data", aoReceber);
  });
}

async function main() {
  const [nome, emailBruto] = process.argv.slice(2);
  if (!nome || !emailBruto) {
    console.error('Uso: pnpm admin:criar "Nome Completo" email@exemplo.com');
    process.exit(1);
  }
  const email = emailBruto.trim().toLowerCase();

  const senha = await perguntarSenha("Senha: ");
  const confirmacao = await perguntarSenha("Repita a senha: ");

  if (senha !== confirmacao) {
    console.error("As senhas não conferem.");
    process.exit(1);
  }
  if (senha.length < 10) {
    console.error("Use pelo menos 10 caracteres.");
    process.exit(1);
  }

  const passwordHash = await gerarHashDeSenha(senha);
  const existente = await db.user.findUnique({ where: { email } });

  await db.user.upsert({
    where: { email },
    update: { name: nome, passwordHash },
    create: { email, name: nome, passwordHash },
  });

  console.log(
    existente
      ? `Senha atualizada para ${email}.`
      : `Usuária ${nome} <${email}> criada. Entre em /admin/entrar.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
