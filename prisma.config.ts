import { config as carregarEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// O Next carrega .env.local sozinho; a CLI do Prisma e o seed não.
carregarEnv({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Este arquivo só é lido pela CLI (migrate, studio, seed), e migration é
    // DDL: usa a conexão DIRETA do Neon. O runtime da aplicação usa a conexão
    // com pool (DATABASE_URL), configurada em src/lib/db.ts.
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
