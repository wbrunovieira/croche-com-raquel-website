"use client";

import { useEffect, useRef } from "react";

/**
 * Revela o conteúdo quando ele entra na tela.
 *
 * **O HTML sai do servidor visível.** A versão anterior usava `motion` com
 * `initial={{ opacity: 0 }}`, e o `initial` do framer-motion vira `style`
 * inline já no SSR: 31 elementos da home — incluindo o `<h1>` do hero, que é o
 * candidato a LCP — chegavam ao navegador com `opacity: 0` e só apareciam
 * depois de baixar, parsear e hidratar o bundle. Num celular vindo do
 * Instagram, isso é tela vazia por tempo que não precisa existir.
 *
 * Agora quem esconde é o CSS, e só dentro de `@media (scripting: enabled)`.
 * Sem JavaScript, ou com JavaScript lento, o site inteiro continua legível — o
 * conteúdo nunca depende de um script para existir. A pergunta é feita pelo
 * próprio CSS, sem classe posta por script inline na raiz: aquela versão fazia
 * o React acusar mismatch de hidratação no `<html>` a cada navegação.
 *
 * `once` continua proposital: reanimar a cada rolagem cansa e faz o site
 * parecer inquieto. Por isso o observador se desconecta na primeira aparição.
 *
 * Quem pede menos movimento não precisa de tratamento aqui: o bloco global de
 * `prefers-reduced-motion` zera duração *e* atraso, então o conteúdo aparece
 * inteiro assim que o observador dispara.
 */

/**
 * Como a seção entra. O gesto diz que tipo de seção é aquela — antes tudo
 * entrava igual, e a página inteira parecia uma coisa só.
 *
 *  - `fio`   — o padrão: sobe 24px com fade.
 *  - `ponto` — cabeçalho de seção: a cascata acontece nos FILHOS (etiqueta,
 *              título, apoio), curta e precisa, como pontos seguidos.
 *  - `grade` — catálogo: só opacidade. Nada se move na frente de quem compara.
 *  - `trama` / `trama-inversa` — seção verde: o fio atravessa na horizontal,
 *              de lados opostos nas duas metades.
 *  - `texto` — bloco de leitura: assenta devagar, quase sem deslocamento.
 *
 * O desenho de cada um mora no `globals.css`, junto dos outros quadros — o
 * movimento é decisão de identidade, não de componente.
 */
export type Entrada = "fio" | "ponto" | "grade" | "trama" | "trama-inversa" | "texto";

export function Revelar({
  children,
  atraso = 0,
  entrada = "fio",
  decorativo = false,
  className = "",
  as: Componente = "div",
}: {
  /** Opcional porque a corrente (`.corrente`) é uma faixa vazia e decorativa. */
  children?: React.ReactNode;
  atraso?: number;
  entrada?: Entrada;
  /** Ornamento sem conteúdo: sai do alcance dos leitores de tela. */
  decorativo?: boolean;
  className?: string;
  as?: "div" | "section" | "ul" | "li" | "span";
}) {
  const alvo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = alvo.current;
    if (!el) return;

    // Se já está na tela no primeiro quadro (acima da dobra), revela sem
    // esperar rolagem — o IntersectionObserver dispara de imediato nesse caso.
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        el.dataset.revelado = "";
        observador.disconnect();
      },
      { rootMargin: "-80px" }
    );

    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  // O atraso não vale para `ponto`: lá quem anima são os filhos, e cada um já
  // tem o seu. Empilhar os dois faria a cascata começar depois da seção.
  const atrasar = atraso > 0 && entrada !== "ponto";

  return (
    <Componente
      ref={alvo as never}
      aria-hidden={decorativo || undefined}
      className={`revelar ${entrada === "fio" ? "" : `revelar--${entrada}`} ${className}`}
      style={atrasar ? { animationDelay: `${atraso}s` } : undefined}
    >
      {children}
    </Componente>
  );
}
