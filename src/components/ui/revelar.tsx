"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Revela o conteúdo quando ele entra na tela.
 *
 * `once` é proposital: reanimar a cada rolagem cansa e faz o site parecer
 * inquieto. Quem pede menos movimento recebe o conteúdo direto, sem transição.
 */
export function Revelar({
  children,
  atraso = 0,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  atraso?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const semMovimento = useReducedMotion();
  const Componente = motion[as];

  return (
    <Componente
      initial={semMovimento ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={semMovimento ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: atraso, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Componente>
  );
}
