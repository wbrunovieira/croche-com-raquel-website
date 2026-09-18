"use client";

import { useEffect } from "react";
import { classesDeBotao } from "@/components/ui/botao";

/**
 * A tela de erro do painel, e ela fala com a Raquel.
 *
 * O painel é onde ela trabalha, e o pior momento para ver uma tela técnica é
 * depois de ter digitado uma peça inteira. A mensagem diz duas coisas que
 * importam: que não foi ela que quebrou, e que o que já estava salvo continua
 * salvo.
 */
export default function ErroDoPainel({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("erro no painel:", error);
  }, [error]);

  return (
    <div className="container-site secao">
      <div className="max-w-texto">
        <h1 className="font-display text-t1 text-conteudo">
          Deu um problema aqui
        </h1>
        <p className="mt-bloco text-apoio text-conteudo-suave">
          Não foi nada que você fez — e o que já estava salvo continua salvo.
          Tente de novo; se continuar, me avise que eu olho.
        </p>
        <div className="mt-bloco flex flex-wrap gap-4">
          <button type="button" onClick={reset} className={classesDeBotao("primaria")}>
            Tentar de novo
          </button>
          <a href="/admin" className={classesDeBotao("secundaria")}>
            Voltar ao início do painel
          </a>
        </div>
      </div>
    </div>
  );
}
