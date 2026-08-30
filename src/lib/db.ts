import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { urlComSslVerificado } from "./db-url";

// O adapter é criado uma vez por processo. Em dev o Next recarrega os
// módulos a cada alteração, então o cliente é guardado no globalThis para
// não abrir um pool novo a cada hot reload.
const globalParaPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function criarCliente() {
  const adapter = new PrismaPg({
    connectionString: urlComSslVerificado(process.env.DATABASE_URL),
  });
  return new PrismaClient({ adapter });
}

export const db = globalParaPrisma.prisma ?? criarCliente();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = db;
}
