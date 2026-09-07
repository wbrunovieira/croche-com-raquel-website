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
 * Agora quem esconde é o CSS, e só atrás da classe `.js` que o `layout.tsx`
 * marca na raiz antes da primeira pintura. Sem JavaScript, ou com JavaScript
 * lento, o site inteiro continua legível — o conteúdo nunca depende de um
 * script para existir.
 *
 * `once` continua proposital: reanimar a cada rolagem cansa e faz o site
 * parecer inquieto. Por isso o observador se desconecta na primeira aparição.
 *
 * Quem pede menos movimento não precisa de tratamento aqui: o bloco global de
 * `prefers-reduced-motion` zera duração *e* atraso, então o conteúdo aparece
 * inteiro assim que o observador dispara.
 */
export function Revelar({
  children,
  atraso = 0,
  className = "",
  as: Componente = "div",
}: {
  children: React.ReactNode;
  atraso?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
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

  return (
    <Componente
      ref={alvo as never}
      className={`revelar ${className}`}
      style={atraso ? { animationDelay: `${atraso}s` } : undefined}
    >
      {children}
    </Componente>
  );
}
