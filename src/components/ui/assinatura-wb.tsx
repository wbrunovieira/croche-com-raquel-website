import { ArrowUpRight, Code2 } from "lucide-react";

/**
 * Assinatura da WB Digital Solutions no pé do site.
 *
 * **Componente compartilhado entre projetos** — a origem é a
 * `wb-signature.tsx` do `padariarainhadamassa-website`. O conteúdo e o destino
 * são os mesmos; o que mudou foram os materiais, porque cada site tem os seus.
 *
 * O que foi adaptado, e por quê:
 *
 * - **O coração pulsante saiu.** Lá ele é um detalhe simpático; aqui seria o
 *   SEGUNDO laço periódico na tela — o novelo do logotipo já bate, e o
 *   cabeçalho é fixo, então os dois apareceriam juntos. A identidade (§7.2)
 *   permite um ciclo periódico por tela, e ele já tem dono. Sem o coração, o
 *   texto fica "Feito por", que é o que importa.
 * - **Raio e curva são os daqui:** `rounded-fio` (6px) e `--ease-fio`, em vez
 *   do `rounded-lg` e das transições avulsas da origem.
 * - **O brilho desfocado saiu.** `blur-xl` numa camada que acende no hover é
 *   caro e não pertence a um site cuja assinatura visual é fio e trama.
 *
 * Herda a cor do contexto por `currentColor`, então serve em qualquer fundo
 * sem variante — é a única coisa da origem que não precisou mudar.
 */
export function AssinaturaWB({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <span className="text-legenda">Feito por</span>
      <a
        href="https://www.wbdigitalsolutions.com"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 rounded-fio border border-current/25 px-2 py-1 transition-[background-color,border-color] duration-[240ms] ease-fio hover:border-current/50 hover:bg-white/10"
      >
        <Code2
          aria-hidden="true"
          className="size-3.5 transition-transform duration-[240ms] ease-fio group-hover:rotate-12"
        />
        <span className="text-legenda font-medium tracking-[0.04em]">
          WB Digital Solutions
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-3 opacity-60 transition-[transform,opacity] duration-[240ms] ease-fio group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </a>
    </div>
  );
}
