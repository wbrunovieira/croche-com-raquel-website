"use client";

import { startTransition, useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, Copy, Trash2 } from "lucide-react";
import { apagarProduto, duplicarProduto, salvarProduto } from "@/app/admin/produtos/acoes";
import { AreaDeTexto, Campo, Marcador, Secao, Selecao } from "@/components/admin/campos";
import { classesDeBotao } from "@/components/ui/botao";

export type ProdutoParaFormulario = {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  preco: string;
  categoriaId: string;
  status: "DRAFT" | "PUBLISHED";
  destaque: boolean;
};

export function FormularioDeProduto({
  produto,
  categorias,
}: {
  produto: ProdutoParaFormulario;
  categorias: { id: string; nome: string }[];
}) {
  const [estado, acao, salvando] = useActionState(salvarProduto, null);
  const [pendente, iniciar] = useTransition();
  const [destaque, setDestaque] = useState(produto.destaque);


  return (
    <form
      // `onSubmit` em vez de `action`: uma ação passada em `<form action>` faz
      // o React 19 limpar o formulário quando ela termina, inclusive em erro.
      // Aqui isso significava ela corrigir um preço, esbarrar num aviso e ver
      // os campos voltarem ao que estava salvo — perdendo o que acabou de
      // escrever. Mesmo conserto da tela de nova peça.
      onSubmit={(e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        startTransition(() => acao(dados));
      }}
    >
      <input type="hidden" name="id" value={produto.id} />

      {estado?.erro ? (
        <p role="alert" className="mb-bloco rounded-fio bg-goiaba-clara px-4 py-3 text-apoio">
          {estado.erro}
        </p>
      ) : null}
      {estado?.ok ? (
        <p role="status" className="mb-bloco rounded-fio bg-nevoa px-4 py-3 text-apoio">
          {estado.ok}
        </p>
      ) : null}

      <Secao titulo="O básico">
        <Campo id="name" rotulo="Nome" defaultValue={produto.nome} required />
        <AreaDeTexto
          id="description"
          rotulo="Descrição"
          dica="É o texto que aparece na página da peça. Escreva como você contaria para uma cliente."
          defaultValue={produto.descricao}
          required
        />
        <Campo
          id="price"
          rotulo="Preço"
          dica="Deixe em branco para a peça aparecer como “sob consulta”. Nunca coloque 0."
          inputMode="decimal"
          placeholder="320"
          defaultValue={produto.preco}
        />
      </Secao>

      <Secao titulo="Onde ela fica">
        <Selecao
          id="categoryId"
          rotulo="Categoria"
          defaultValue={produto.categoriaId}
          required
        >
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Selecao>

      </Secao>

      <Secao titulo="Vitrine e publicação">
        <Marcador
          id="featured"
          rotulo="Mostrar em destaque na home"
          checked={destaque}
          onChange={(e) => setDestaque(e.target.checked)}
        />
        <Selecao
          id="status"
          rotulo="Situação"
          dica="Fora do ar, a peça fica só aqui no painel. No ar, ela aparece no site."
          defaultValue={produto.status}
        >
          <option value="DRAFT">Fora do ar</option>
          <option value="PUBLISHED">No ar</option>
        </Selecao>
      </Secao>

      <div className="sticky bottom-0 mt-respiro flex flex-wrap items-center gap-4 border-t border-borda bg-fundo/95 py-4 backdrop-blur">
        <button type="submit" disabled={salvando} className={classesDeBotao()}>
          {salvando ? "Salvando…" : "Salvar"}
        </button>

        <Link
          href={`/produtos/${produto.slug}`}
          target="_blank"
          className={classesDeBotao("secundaria", "sm")}
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          Ver no site
        </Link>

        <button
          type="button"
          disabled={pendente}
          onClick={() => iniciar(() => duplicarProduto(produto.id))}
          className={classesDeBotao("secundaria", "sm")}
        >
          <Copy className="size-4" aria-hidden="true" />
          Duplicar
        </button>

        <button
          type="button"
          disabled={pendente}
          onClick={() => {
            if (
              confirm(
                `Apagar “${produto.nome}” e todas as fotos dela? Não dá para desfazer.`
              )
            ) {
              iniciar(() => apagarProduto(produto.id));
            }
          }}
          className="ml-auto inline-flex items-center gap-2 py-2 text-apoio text-erro underline underline-offset-4 hover:no-underline"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Apagar peça
        </button>
      </div>
    </form>
  );
}
