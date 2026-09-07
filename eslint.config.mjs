import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Worktrees de agente: são cópias do repositório dentro dele, com `.next`
    // próprio. Sem isto o eslint varre o build delas e reporta o código do
    // projeto duas vezes, mais o bundle gerado — ruído que já mascarou erro de
    // verdade numa revisão.
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
