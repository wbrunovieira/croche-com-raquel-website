"use client";

import { useMemo, useState } from "react";
import { classesDeBotao } from "@/components/ui/botao";
import { CampoQuantidade } from "@/components/ui/campo-quantidade";
import { CampoTexto } from "@/components/ui/campo-texto";
import { IconeZap } from "@/components/ui/icone-zap";
import { SeletorDeCor } from "@/components/ui/seletor-de-cor";
import { SeletorDeOpcao } from "@/components/ui/seletor-de-opcao";
import { codigoDoProduto, montarLinkWhatsApp, montarMensagem } from "@/lib/whatsapp";
import type { GrupoDeOpcao } from "@/lib/queries/tipos";

/**
 * O bloco de pedido — é aqui que o site converte.
 *
 * Tudo que a cliente escolhe entra na mensagem do WhatsApp junto com o nome da
 * peça e o link da página. Sem isso a Raquel recebe um "oi, quero uma bolsa" e
 * precisa perguntar tudo de novo, que é exatamente o atrito que o site existe
 * para remover.
 *
 * O botão fica desabilitado enquanto falta escolha obrigatória, e diz o que
 * falta — em vez de deixar a pessoa clicar e mandar um pedido incompleto.
 */
export function Pedido({
  nomeDoProduto,
  slugDoProduto,
  grupos,
  numeroDoWhatsapp,
  template,
  urlDaPagina,
}: {
  nomeDoProduto: string;
  slugDoProduto: string;
  grupos: GrupoDeOpcao[];
  numeroDoWhatsapp: string;
  template: string;
  urlDaPagina: string;
}) {
  const [escolhas, setEscolhas] = useState<Record<string, string>>({});
  const [quantidade, setQuantidade] = useState(1);

  const faltando = grupos.filter((g) => g.obrigatorio && !escolhas[g.slug]?.trim());
  const completo = faltando.length === 0;

  const link = useMemo(() => {
    const mensagem = montarMensagem(template, {
      produto: nomeDoProduto,
      codigo: codigoDoProduto(slugDoProduto),
      escolhas: grupos
        .map((g) => {
          const bruto = escolhas[g.slug]?.trim() ?? "";
          if (bruto === "") return null;
          const rotulo =
            g.tipo === "TEXT"
              ? bruto
              : (g.valores.find((v) => v.slug === bruto)?.nome ?? bruto);
          return { grupo: g.nome, valor: rotulo };
        })
        .filter((e): e is { grupo: string; valor: string } => e !== null),
      quantidade,
      link: urlDaPagina,
    });
    return montarLinkWhatsApp(numeroDoWhatsapp, mensagem);
  }, [escolhas, grupos, nomeDoProduto, numeroDoWhatsapp, quantidade, slugDoProduto, template, urlDaPagina]);

  function definir(slug: string, valor: string) {
    setEscolhas((e) => ({ ...e, [slug]: valor }));
  }

  return (
    <div>
      {grupos.map((g) => (
        <div key={g.id} className="mt-bloco first:mt-0">
          {g.tipo === "TEXT" ? (
            <>
              <label htmlFor={`opcao-${g.slug}`} className="text-apoio font-medium">
                {g.nome}
                {g.obrigatorio ? <span className="text-destaque-texto"> *</span> : null}
              </label>
              <div className="mt-3">
                <CampoTexto
                  id={`opcao-${g.slug}`}
                  valor={escolhas[g.slug] ?? ""}
                  aoMudar={(v) => definir(g.slug, v)}
                  placeholder="Nome ou monograma"
                  ajuda={g.obrigatorio ? undefined : "Opcional"}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-apoio font-medium">
                {g.nome}
                {g.obrigatorio ? <span className="text-destaque-texto"> *</span> : null}
              </p>
              <div className="mt-3">
                {g.slug === "cor" ? (
                  <SeletorDeCor
                    valores={g.valores}
                    selecionado={escolhas[g.slug] ?? null}
                    aoSelecionar={(v) => definir(g.slug, v)}
                    nomeDoGrupo={g.nome}
                  />
                ) : (
                  <SeletorDeOpcao
                    valores={g.valores}
                    selecionado={escolhas[g.slug] ?? null}
                    aoSelecionar={(v) => definir(g.slug, v)}
                    nomeDoGrupo={g.nome}
                  />
                )}
              </div>
            </>
          )}
        </div>
      ))}

      <div className="mt-bloco">
        <p className="text-apoio font-medium">Quantidade</p>
        <div className="mt-3">
          <CampoQuantidade valor={quantidade} aoMudar={setQuantidade} />
        </div>
      </div>

      {/* No desktop o botão fica no fluxo; no mobile ele também vira barra fixa
          no rodapé, porque a página é longa e o CTA não pode ficar para trás. */}
      <div className="mt-bloco hidden sm:block">
        <BotaoPedir link={link} completo={completo} />
        <FaltaEscolher grupos={faltando} />
      </div>

      <div className="mt-bloco sm:hidden">
        <FaltaEscolher grupos={faltando} />
      </div>

      {/* A barra fixa cobre o fim da página; quem reserva o espaço dela é o
          rodapé (`pb-zap-flutua sm:pb-0`), porque ele é o último elemento do
          documento — um espaçador aqui dentro ficaria no meio da página. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-superficie/95 p-4 backdrop-blur sm:hidden">
        <BotaoPedir link={link} completo={completo} bloco />
      </div>
    </div>
  );
}

function BotaoPedir({
  link,
  completo,
  bloco = false,
}: {
  link: string;
  completo: boolean;
  bloco?: boolean;
}) {
  const classes = `${classesDeBotao("primaria")} ${bloco ? "w-full" : ""}`;

  if (!completo) {
    return (
      <button type="button" className={classes} disabled aria-disabled="true">
        <IconeZap className="size-5" />
        Pedir pelo WhatsApp
      </button>
    );
  }

  return (
    <a className={classes} href={link} target="_blank" rel="noopener noreferrer">
      <IconeZap className="size-5" />
      Pedir pelo WhatsApp
    </a>
  );
}

function FaltaEscolher({ grupos }: { grupos: GrupoDeOpcao[] }) {
  if (grupos.length === 0) return null;
  return (
    <p className="mt-3 text-apoio text-conteudo-suave" role="status">
      Falta escolher: {grupos.map((g) => g.nome).join(", ")}.
    </p>
  );
}
