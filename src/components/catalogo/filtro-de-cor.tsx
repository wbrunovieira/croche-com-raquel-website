"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

/**
 * Filtro por cor do catálogo.
 *
 * O estado mora na URL, não em `useState`: assim o filtro sobrevive ao
 * recarregar, volta certo no botão de voltar, e a Raquel consegue mandar para a
 * cliente um link já filtrado — "olha as bolsas em terracota".
 */
export function FiltroDeCor({
  cores,
}: {
  cores: { id: string; slug: string; nome: string; hex: string }[];
}) {
  const router = useRouter();
  const caminho = usePathname();
  const parametros = useSearchParams();
  const semMovimento = useReducedMotion();
  const atual = parametros.get("cor");

  if (cores.length === 0) return null;

  function irPara(cor: string | null) {
    const p = new URLSearchParams(parametros.toString());
    if (cor) p.set("cor", cor);
    else p.delete("cor");
    const busca = p.toString();
    router.push(busca ? `${caminho}?${busca}` : caminho, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-texto text-etiqueta uppercase text-conteudo-suave">
        Cor
      </span>

      <ul className="flex flex-wrap gap-2">
        {cores.map((c) => {
          const ativa = c.slug === atual;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => irPara(ativa ? null : c.slug)}
                aria-pressed={ativa}
                title={c.nome}
                className={`block size-controle-sm rounded-pilula border border-borda-forte/40 transition-shadow ${
                  ativa ? "ring-2 ring-conteudo ring-offset-2 ring-offset-fundo" : ""
                }`}
                style={{ backgroundColor: c.hex }}
              >
                <span className="sr-only">{c.nome}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {atual ? (
        <motion.button
          type="button"
          initial={semMovimento ? false : { opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => irPara(null)}
          className="inline-flex items-center gap-1 py-2 -my-2 text-apoio text-destaque-texto underline underline-offset-4 hover:no-underline"
        >
          <X className="size-4" aria-hidden="true" />
          Limpar
        </motion.button>
      ) : null}
    </div>
  );
}
