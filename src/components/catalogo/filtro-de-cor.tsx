"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { DURACAO, transicao } from "@/lib/movimento";

/**
 * Filtro por cor do catálogo.
 *
 * O estado mora na URL, não em `useState`: assim o filtro sobrevive ao
 * recarregar, volta certo no botão de voltar, e a Raquel consegue mandar para a
 * cliente um link já filtrado — "olha as bolsas em terracota".
 *
 * O preço disso era o silêncio: `router.push` sem `useTransition` significa que
 * a pessoa toca numa bolinha e **nada acontece** até o servidor responder com a
 * grade nova. Num celular em 4G isso é meio segundo achando que o toque não
 * pegou — e o segundo toque cancela o primeiro.
 *
 * A correção tem duas partes, e a primeira é a que importa: enquanto a
 * navegação está em curso, o anel de selecionado já vai para a cor tocada. O
 * retorno é instantâneo porque é local; a URL confirma depois. A segunda é o
 * "filtrando…", para quando a espera passa do imperceptível.
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
  const [pendente, iniciar] = useTransition();
  const [desejada, setDesejada] = useState<string | null>(null);

  // Enquanto a navegação corre, manda a escolha local; terminada, quem manda
  // volta a ser a URL — que é a fonte da verdade.
  const atual = pendente ? desejada : parametros.get("cor");

  if (cores.length === 0) return null;

  function irPara(cor: string | null) {
    const p = new URLSearchParams(parametros.toString());
    if (cor) p.set("cor", cor);
    else p.delete("cor");
    const busca = p.toString();
    setDesejada(cor);
    iniciar(() => {
      router.push(busca ? `${caminho}?${busca}` : caminho, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3" aria-busy={pendente}>
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
                // `duration-200` no anel: ele acompanha o dedo, não espera o
                // servidor. `active:scale-90` é o retorno do toque em si —
                // numa bolinha de 36px, subir 2px não se vê.
                className={`block size-controle-sm rounded-pilula border border-borda-forte/40 transition-[box-shadow,transform] duration-200 ease-fio active:scale-90 ${
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

      {/* `initial={false}` no AnimatePresence: com um filtro já na URL, esta
          página é servida pelo servidor com o botão presente — e o `initial` do
          motion viraria `style="opacity:0"` no HTML. Assim só a entrada
          provocada por um clique anima. */}
      <AnimatePresence initial={false}>
        {atual ? (
          <motion.button
            key="limpar"
            type="button"
            initial={semMovimento ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={semMovimento ? { opacity: 0 } : { opacity: 0, x: -6 }}
            transition={transicao(DURACAO.curta, semMovimento)}
            onClick={() => irPara(null)}
            className="inline-flex items-center gap-1 py-2 -my-2 text-apoio text-destaque-texto underline underline-offset-4 hover:no-underline"
          >
            <X className="size-4" aria-hidden="true" />
            Limpar
          </motion.button>
        ) : null}
      </AnimatePresence>

      {/* Sem laço e sem girar: aparece, e some quando a grade chega. */}
      <span
        role="status"
        aria-live="polite"
        className={`text-legenda text-conteudo-suave transition-opacity duration-200 ${
          pendente ? "opacity-100" : "opacity-0"
        }`}
      >
        {pendente ? "filtrando…" : ""}
      </span>
    </div>
  );
}
