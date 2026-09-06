"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Check, GripVertical, Trash2, X } from "lucide-react";
import {
  alternarCategoria,
  apagarCategoria,
  reordenarCategorias,
  salvarCategoria,
} from "@/app/admin/acoes-de-conteudo";
import { classesDeBotao } from "@/components/ui/botao";
import { AreaDeTexto, Campo } from "@/components/admin/campos";
import { FormularioSimples } from "@/components/admin/formulario-simples";

export type CategoriaDoAdmin = {
  id: string;
  nome: string;
  descricao: string | null;
  textoLongo: string | null;
  ativa: boolean;
  pecas: number;
};

/**
 * Categorias do painel.
 *
 * Antes eram seis formulários abertos ao mesmo tempo, cada um com uma área de
 * texto de 10 linhas: para editar uma, ela rolava por todas. Agora é card
 * fechado, e o formulário só abre no Editar.
 *
 * **Arrastar e setas convivem, e isso não é redundância.** O arrastar nativo do
 * HTML não funciona em toque nem em teclado — sozinho, quebraria a tela no
 * tablet dela e para quem navega por teclado. As setas são o caminho que
 * sempre funciona; arrastar é o atalho de quem está no mouse.
 *
 * A ordem é aplicada na tela antes de o servidor confirmar. Arrastar e esperar
 * o card voltar ao lugar por meio segundo parece que não funcionou.
 */
export function CategoriasEditaveis({ categorias }: { categorias: CategoriaDoAdmin[] }) {
  const [ordem, setOrdem] = useState(categorias);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  /**
   * Aplica a ordem nova na tela e grava.
   *
   * Arrastar e as setas passam pelo mesmo caminho de propósito: o estado local
   * é a fonte da ordem enquanto a tela está aberta, e um caminho que só grava
   * no servidor deixaria a lista parada até um recarregamento — foi o que
   * aconteceu quando as setas chamavam uma ação própria.
   */
  const reordenar = (de: number, para: number) => {
    if (de === para || de < 0 || para < 0 || para >= ordem.length) return;
    const nova = [...ordem];
    const [movida] = nova.splice(de, 1);
    nova.splice(para, 0, movida!);
    setOrdem(nova);
    iniciar(() => reordenarCategorias(nova.map((c) => c.id)));
  };

  /**
   * Desativar e apagar também mexem no estado local.
   *
   * O `ordem` é semeado dos props e o React não o re-semeia quando o servidor
   * revalida: sem isto, ela clica em Desativar, o banco grava, e o botão
   * continua escrito "Desativar" — parece que não funcionou.
   */
  const alternar = (id: string) => {
    const alvo = ordem.find((c) => c.id === id);
    if (!alvo) return;
    setOrdem(ordem.map((c) => (c.id === id ? { ...c, ativa: !c.ativa } : c)));
    iniciar(() => alternarCategoria(id, !alvo.ativa));
  };

  const apagar = (id: string, aoFalhar: (erro: string) => void) => {
    iniciar(async () => {
      const r = await apagarCategoria(id);
      if (r.erro) aoFalhar(r.erro);
      else setOrdem((atual) => atual.filter((c) => c.id !== id));
    });
  };

  const soltarSobre = (alvoId: string) => {
    if (!arrastando || arrastando === alvoId) return;
    reordenar(
      ordem.findIndex((c) => c.id === arrastando),
      ordem.findIndex((c) => c.id === alvoId)
    );
  };

  return (
    <ul className="space-y-4">
      {ordem.map((c, i) => (
        <li
          key={c.id}
          draggable
          onDragStart={() => setArrastando(c.id)}
          onDragEnd={() => setArrastando(null)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => soltarSobre(c.id)}
          className={`rounded-card border bg-superficie p-painel transition-shadow ${
            arrastando === c.id ? "border-borda-forte shadow-alta" : "border-borda"
          } ${c.ativa ? "" : "opacity-60"}`}
        >
          <Cartao
            categoria={c}
            primeira={i === 0}
            ultima={i === ordem.length - 1}
            pendente={pendente}
            aoMover={(direcao) => reordenar(i, i + direcao)}
            aoAlternar={() => alternar(c.id)}
            aoApagar={(aoFalhar) => apagar(c.id, aoFalhar)}
          />
        </li>
      ))}
    </ul>
  );
}

function Cartao({
  categoria: c,
  primeira,
  ultima,
  pendente,
  aoMover,
  aoAlternar,
  aoApagar,
}: {
  categoria: CategoriaDoAdmin;
  primeira: boolean;
  ultima: boolean;
  pendente: boolean;
  aoMover: (direcao: -1 | 1) => void;
  aoAlternar: () => void;
  aoApagar: (aoFalhar: (erro: string) => void) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  // Mover, desativar e apagar são do componente de cima, que é quem tem a lista
  // para atualizar. Aqui só sobra o abrir e fechar do formulário.
  const travado = pendente;

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        {/* A alça diz que dá para arrastar. Sem ela ninguém descobre. */}
        <span
          aria-hidden="true"
          className="cursor-grab text-conteudo-suave active:cursor-grabbing"
          title="Arraste para mudar a ordem"
        >
          <GripVertical className="size-5" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block font-display text-t3">{c.nome}</span>
          <span className="mt-1 block text-apoio text-conteudo-suave">
            {c.pecas} {c.pecas === 1 ? "peça" : "peças"}
            {c.ativa ? "" : " · desativada, sai do menu e dos filtros"}
          </span>
        </span>

        <span className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="flex items-center gap-1">
            <button
              type="button"
              disabled={primeira || travado}
              aria-label={`Mover ${c.nome} para cima`}
              onClick={() => aoMover(-1)}
              className="rounded-fio border border-borda-forte p-2 transition-colors hover:bg-superficie-baixa disabled:opacity-40"
            >
              <ArrowUp className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={ultima || travado}
              aria-label={`Mover ${c.nome} para baixo`}
              onClick={() => aoMover(1)}
              className="rounded-fio border border-borda-forte p-2 transition-colors hover:bg-superficie-baixa disabled:opacity-40"
            >
              <ArrowDown className="size-4" aria-hidden="true" />
            </button>
          </span>

          <button
            type="button"
            onClick={() => setEditando((v) => !v)}
            className={classesDeBotao("secundaria", "sm")}
          >
            {editando ? "Fechar" : "Editar"}
          </button>

          <button
            type="button"
            disabled={travado}
            onClick={aoAlternar}
            className={classesDeBotao("secundaria", "sm")}
          >
            {c.ativa ? (
              <>
                <X className="size-4" aria-hidden="true" />
                Desativar
              </>
            ) : (
              <>
                <Check className="size-4" aria-hidden="true" />
                Reativar
              </>
            )}
          </button>

          {/* Apagar só aparece quando é possível. Botão que existe para depois
              recusar é armadilha: ela clica, leva um "não pode" e fica sem
              saber o que fazer. Com peça dentro, o caminho é desativar. */}
          {c.pecas === 0 ? (
            <button
              type="button"
              disabled={travado}
              aria-label={`Apagar ${c.nome}`}
              onClick={() => aoApagar(setErro)}
              className="rounded-fio border border-borda-forte p-2 text-erro transition-colors hover:bg-superficie-baixa"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </span>
      </div>

      {erro ? (
        <p role="alert" className="mt-4 rounded-fio bg-goiaba-clara px-3 py-2 text-legenda">
          {erro}
        </p>
      ) : null}

      {editando ? (
        <div className="mt-bloco border-t border-borda pt-bloco">
          <FormularioSimples acao={salvarCategoria}>
            <input type="hidden" name="id" value={c.id} />
            <Campo id={`name-${c.id}`} name="name" rotulo="Nome" defaultValue={c.nome} required />
            <AreaDeTexto
              id={`description-${c.id}`}
              name="description"
              rotulo="Uma linha"
              dica="Aparece abaixo do título e no card da home."
              rows={2}
              defaultValue={c.descricao ?? ""}
            />
            <AreaDeTexto
              id={`longDescription-${c.id}`}
              name="longDescription"
              rotulo="Texto longo da página"
              dica="Opcional. É o conteúdo que o Google lê. Use ## para subtítulo e **palavra** para negrito."
              rows={10}
              defaultValue={c.textoLongo ?? ""}
            />
          </FormularioSimples>
        </div>
      ) : null}
    </>
  );
}
