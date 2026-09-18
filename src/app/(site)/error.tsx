"use client";

import { useEffect } from "react";
import { classesDeBotao } from "@/components/ui/botao";

/**
 * A tela de quando algo quebra do lado do servidor.
 *
 * **Sem ela, banco fora do ar significa tela de erro crua do Next na home** — e
 * `buscarConfiguracoes()` lança de propósito quando a linha de configuração não
 * existe, com uma mensagem escrita para programador ("Rode pnpm db:seed"). Essa
 * frase não pode ser o que uma cliente lê.
 *
 * É Client Component por exigência do Next: só assim ela recebe o `reset`, que
 * tenta renderizar de novo. Falha de banco costuma ser intermitente, então
 * "tentar de novo" resolve boa parte das vezes — e o WhatsApp fica ali para
 * quando não resolver, porque a conversa não depende deste site estar de pé.
 */
export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Vai para o log da Vercel com o `digest`, que é como se acha a ocorrência.
    console.error("erro na página:", error);
  }, [error]);

  return (
    <main id="topo" className="container-site secao">
      <div className="max-w-texto">
        <p className="text-etiqueta uppercase text-conteudo-suave">
          Algo deu errado
        </p>
        <h1 className="mt-3 font-display text-t1 text-conteudo">
          Não consegui carregar esta página
        </h1>
        <p className="mt-bloco text-apoio text-conteudo-suave">
          O problema é aqui, não com você. Tente de novo — costuma ser passageiro.
          Se insistir, me chame no WhatsApp que eu respondo por lá do mesmo jeito.
        </p>
        <div className="mt-bloco flex flex-wrap gap-4">
          <button type="button" onClick={reset} className={classesDeBotao("primaria")}>
            Tentar de novo
          </button>
          {/* `<a>` e não `<Link>`, de propósito: navegação do `next/link` é do
              lado do cliente e **preserva a árvore React que acabou de
              quebrar**. Aqui o que se quer é recarregar do zero. O "Tentar de
              novo" acima já cobre a tentativa suave. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className={classesDeBotao("secundaria")}>
            Voltar ao início
          </a>
        </div>
      </div>
    </main>
  );
}
