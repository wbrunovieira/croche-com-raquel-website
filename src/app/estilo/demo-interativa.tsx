"use client";

import { useState } from "react";
import { Botao } from "@/components/ui/botao";
import { CampoDeCor, type DadosDaCor } from "@/components/admin/campo-de-cor";
import { CampoQuantidade } from "@/components/ui/campo-quantidade";
import { CampoTexto } from "@/components/ui/campo-texto";
import { Etiqueta } from "@/components/ui/etiqueta";
import { IconeZap } from "@/components/ui/icone-zap";
import { SeletorDeCor } from "@/components/ui/seletor-de-cor";
import { SeletorDeOpcao } from "@/components/ui/seletor-de-opcao";
import { codigoDoProduto, montarMensagem } from "@/lib/whatsapp";
import type { GrupoDeOpcao } from "@/lib/queries/tipos";

/**
 * Amostra viva dos controles da página de produto. Usa um produto real do
 * banco e monta a mensagem de WhatsApp de verdade, para dar para conferir o
 * texto que chega antes de a página existir.
 */
export function DemoInterativa({
  grupos,
  nomeDoProduto,
  slugDoProduto,
  template,
}: {
  grupos: GrupoDeOpcao[];
  nomeDoProduto: string;
  slugDoProduto: string;
  template: string;
}) {
  const [escolhas, setEscolhas] = useState<Record<string, string>>({});
  const [quantidade, setQuantidade] = useState(1);

  const grupoCor = grupos.find((g) => g.slug === "cor");
  const gruposPilula = grupos.filter((g) => g.tipo !== "TEXT" && g.slug !== "cor");
  const grupoTexto = grupos.find((g) => g.tipo === "TEXT");

  const mensagem = montarMensagem(template, {
    produto: nomeDoProduto,
    codigo: codigoDoProduto(slugDoProduto),
    escolhas: grupos
      .map((g) => {
        const bruto = escolhas[g.slug] ?? "";
        if (bruto === "") return null;
        const rotulo =
          g.tipo === "TEXT"
            ? bruto
            : (g.valores.find((v) => v.slug === bruto)?.nome ?? bruto);
        return { grupo: g.nome, valor: rotulo };
      })
      .filter((e): e is { grupo: string; valor: string } => e !== null),
    quantidade,
    link: `https://crochecomraquel.com.br/produtos/${slugDoProduto}`,
  });

  const faltando = grupos.filter((g) => g.obrigatorio && !escolhas[g.slug]);

  return (
    <div className="grid gap-x-grade-col gap-y-grade-linha lg:grid-cols-2">
      <div className="rounded-card border border-borda bg-superficie p-painel">
        <Etiqueta>Controles da página de produto</Etiqueta>

        {grupoCor ? (
          <div className="mt-bloco">
            <p className="text-apoio font-medium">
              {grupoCor.nome}
              {grupoCor.obrigatorio ? (
                <span className="text-destaque-texto"> *</span>
              ) : null}
            </p>
            <div className="mt-3">
              <SeletorDeCor
                valores={grupoCor.valores}
                selecionado={escolhas[grupoCor.slug] ?? null}
                aoSelecionar={(slug) =>
                  setEscolhas((e) => ({ ...e, [grupoCor.slug]: slug }))
                }
                nomeDoGrupo={grupoCor.nome}
              />
            </div>
          </div>
        ) : null}

        {gruposPilula.map((g) => (
          <div key={g.id} className="mt-bloco">
            <p className="text-apoio font-medium">
              {g.nome}
              {g.obrigatorio ? <span className="text-destaque-texto"> *</span> : null}
            </p>
            <div className="mt-3">
              <SeletorDeOpcao
                valores={g.valores}
                selecionado={escolhas[g.slug] ?? null}
                aoSelecionar={(slug) => setEscolhas((e) => ({ ...e, [g.slug]: slug }))}
                nomeDoGrupo={g.nome}
              />
            </div>
          </div>
        ))}

        {grupoTexto ? (
          <div className="mt-bloco">
            <label htmlFor="demo-personalizacao" className="text-apoio font-medium">
              {grupoTexto.nome}
            </label>
            <div className="mt-3">
              <CampoTexto
                id="demo-personalizacao"
                valor={escolhas[grupoTexto.slug] ?? ""}
                aoMudar={(v) =>
                  setEscolhas((e) => ({ ...e, [grupoTexto.slug]: v }))
                }
                placeholder="Nome ou monograma"
                ajuda="Opcional"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-bloco">
          <p className="text-apoio font-medium">Quantidade</p>
          <div className="mt-3">
            <CampoQuantidade valor={quantidade} aoMudar={setQuantidade} />
          </div>
        </div>

        <div className="mt-bloco">
          <Botao variante="primaria" disabled={faltando.length > 0}>
            <IconeZap className="size-5" />
            Pedir pelo WhatsApp
          </Botao>
          {faltando.length > 0 ? (
            <p className="mt-3 text-apoio text-conteudo-suave">
              Falta escolher: {faltando.map((g) => g.nome).join(", ")}.
            </p>
          ) : null}
        </div>
      </div>

      <div className="trama rounded-card bg-inv-fundo p-painel">
        <Etiqueta tom="invertido">A mensagem que chega para a Raquel</Etiqueta>
        <pre className="mt-bloco overflow-x-auto rounded-fio bg-verde-musgo p-4 font-texto text-apoio leading-relaxed whitespace-pre-wrap text-inv-conteudo">
          {mensagem}
        </pre>
        <p className="mt-4 text-legenda text-inv-suave">
          Montada de verdade pelo template do admin. Mexa nos controles ao lado
          e veja o texto mudar.
        </p>
      </div>
    </div>
  );
}

const COR_INICIAL: DadosDaCor = {
  nome: "Terracota",
  hex: "#B05A3C",
  linhaDoFio: "Barroco Maxcolor 400g",
  codigoDaCor: "7684",
  ativa: true,
};

/** Amostra do cadastro de cor do admin. */
export function DemoCadastroDeCor() {
  const [cor, setCor] = useState<DadosDaCor>(COR_INICIAL);
  return (
    <div>
      <CampoDeCor valor={cor} aoMudar={setCor} />
      <div className="mt-bloco flex flex-wrap items-center gap-4 rounded-card border border-borda bg-superficie-baixa p-painel">
        <span className="text-apoio text-conteudo-suave">Como fica no site:</span>
        {cor.ativa ? (
          <span className="inline-flex items-center gap-3">
            <span
              className="size-controle-sm rounded-pilula border border-borda-forte/40"
              style={{ backgroundColor: cor.hex }}
            />
            <span className="text-apoio">{cor.nome || "sem nome"}</span>
          </span>
        ) : (
          <span className="text-apoio text-conteudo-suave">
            não aparece — cor desabilitada
          </span>
        )}
      </div>
    </div>
  );
}
