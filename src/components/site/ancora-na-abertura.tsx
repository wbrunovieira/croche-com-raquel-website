"use client";

import { useEffect } from "react";

/**
 * Leva à seção quando alguém ABRE uma URL com âncora.
 *
 * O site é de uma página, então `/#encomendas` e `/#catalogo` são endereços de
 * verdade — é assim que o menu navega e é o que se manda por WhatsApp. E eles
 * estavam quebrados: abrir `/#encomendas` parava a 182px de uma seção que fica
 * a 8.300px.
 *
 * A causa é o `scroll-behavior: smooth` do `globals.css`. Ao abrir a página, o
 * navegador começa uma rolagem SUAVE de oito mil pixels — e qualquer coisa que
 * mexa na rolagem durante o percurso a interrompe. Medido: com `smooth` a
 * página para em 182; com `auto` (o que acontece sob `prefers-reduced-motion`)
 * ela chega certinho.
 *
 * Tirar o `smooth` resolveria e custaria o deslizar dos cliques de menu, que é
 * bom. Então a chegada por âncora é feita aqui, **instantânea**, e a suavidade
 * fica para a navegação dentro da página.
 *
 * Roda uma vez, e só quando há âncora: quem abre a home normalmente não é
 * tocado. O segundo ajuste depois do `load` existe porque a altura ainda muda
 * enquanto as fotos entram, e o alvo desliza junto.
 */
export function AncoraNaAbertura() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    const irAteLa = () => {
      const alvo = document.getElementById(id);
      if (!alvo) return;

      /**
       * Desligar o `smooth` no `html` antes de saltar não é preciosismo: pedir
       * `behavior: "auto"` só governa ESTE salto, e a rolagem suave que o
       * navegador começou sozinho ao abrir a URL continua correndo por baixo —
       * as duas brigam e o resultado varia por seção (medido: quatro âncoras
       * chegavam, duas paravam no meio). Zerar a propriedade cancela a que
       * estava em curso.
       */
      const raiz = document.documentElement;
      const antes = raiz.style.scrollBehavior;
      raiz.style.scrollBehavior = "auto";
      alvo.scrollIntoView({ block: "start" });
      // Restaura no quadro seguinte, já com o salto concluído, para os cliques
      // de menu continuarem deslizando.
      requestAnimationFrame(() => {
        raiz.style.scrollBehavior = antes;
      });
    };

    // Dois quadros: o primeiro deixa o React terminar de montar, o segundo
    // pega o layout já calculado.
    const quadro = requestAnimationFrame(() => requestAnimationFrame(irAteLa));
    window.addEventListener("load", irAteLa, { once: true });

    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("load", irAteLa);
    };
  }, []);

  return null;
}
