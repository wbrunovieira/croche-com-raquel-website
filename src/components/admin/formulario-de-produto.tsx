"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, Copy, Trash2 } from "lucide-react";
import { apagarProduto, duplicarProduto, salvarProduto } from "@/app/admin/produtos/acoes";
import { AreaDeTexto, Campo, Marcador, Secao, Selecao } from "@/components/admin/campos";
import { classesDeBotao } from "@/components/ui/botao";

export type GrupoParaFormulario = {
  id: string;
  nome: string;
  tipo: "SINGLE" | "MULTIPLE" | "TEXT";
  valores: { id: string; nome: string; hex: string | null; ativo: boolean }[];
};

export type ProdutoParaFormulario = {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  preco: string;
  medidas: string;
  material: string;
  capacidade: string;
  cuidados: string;
  prazoMin: string;
  prazoMax: string;
  categoriaId: string;
  subcategoriaId: string;
  status: "DRAFT" | "PUBLISHED";
  destaque: boolean;
  posicaoDeDestaque: string;
  posicao: string;
  gruposEscolhidos: { grupoId: string; obrigatorio: boolean; valores: string[] }[];
};

export function FormularioDeProduto({
  produto,
  categorias,
  subcategorias,
  grupos,
}: {
  produto: ProdutoParaFormulario;
  categorias: { id: string; nome: string }[];
  subcategorias: { id: string; nome: string; categoriaId: string }[];
  grupos: GrupoParaFormulario[];
}) {
  const [estado, acao, salvando] = useActionState(salvarProduto, null);
  const [pendente, iniciar] = useTransition();
  const [categoriaId, setCategoriaId] = useState(produto.categoriaId);
  const [destaque, setDestaque] = useState(produto.destaque);

  const [escolhas, setEscolhas] = useState(() => {
    const mapa = new Map<string, { obrigatorio: boolean; valores: Set<string> }>();
    for (const g of produto.gruposEscolhidos) {
      mapa.set(g.grupoId, { obrigatorio: g.obrigatorio, valores: new Set(g.valores) });
    }
    return mapa;
  });

  const subcategoriasDaCategoria = subcategorias.filter(
    (s) => s.categoriaId === categoriaId
  );

  function alternarGrupo(grupoId: string, ligado: boolean) {
    setEscolhas((antigo) => {
      const novo = new Map(antigo);
      if (ligado) novo.set(grupoId, { obrigatorio: false, valores: new Set() });
      else novo.delete(grupoId);
      return novo;
    });
  }

  function alternarValor(grupoId: string, valorId: string, ligado: boolean) {
    setEscolhas((antigo) => {
      const novo = new Map(antigo);
      const atual = novo.get(grupoId);
      if (!atual) return antigo;
      const valores = new Set(atual.valores);
      if (ligado) valores.add(valorId);
      else valores.delete(valorId);
      novo.set(grupoId, { ...atual, valores });
      return novo;
    });
  }

  return (
    <form action={acao}>
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
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          required
        >
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Selecao>

        {subcategoriasDaCategoria.length > 0 ? (
          <Selecao
            id="subcategoryId"
            rotulo="Tipo"
            dica="Só as bolsas usam isto."
            defaultValue={produto.subcategoriaId}
          >
            <option value="">Nenhum</option>
            {subcategoriasDaCategoria.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </Selecao>
        ) : (
          <input type="hidden" name="subcategoryId" value="" />
        )}

        <Campo
          id="position"
          rotulo="Ordem na categoria"
          dica="Menor aparece primeiro."
          type="number"
          min={0}
          defaultValue={produto.posicao}
        />
      </Secao>

      <Secao
        titulo="Detalhes da peça"
        descricao="Tudo opcional. O que estiver em branco simplesmente não aparece na página."
      >
        <Campo id="dimensions" rotulo="Medidas" placeholder="24 × 18 × 8 cm" defaultValue={produto.medidas} />
        <Campo id="material" rotulo="Material" placeholder="Fio de malha de algodão" defaultValue={produto.material} />
        <AreaDeTexto
          id="capacity"
          rotulo="O que cabe dentro"
          dica="Em linguagem de gente: “cabe carteira, celular e chaves”. É o que mais reduz pergunta no WhatsApp."
          rows={2}
          defaultValue={produto.capacidade}
        />
        <AreaDeTexto id="careText" rotulo="Cuidados" rows={3} defaultValue={produto.cuidados} />
        <div className="mt-bloco grid gap-4 sm:grid-cols-2">
          <Campo id="productionDaysMin" rotulo="Prazo mínimo (dias)" type="number" min={1} defaultValue={produto.prazoMin} className="mt-0" />
          <Campo id="productionDaysMax" rotulo="Prazo máximo (dias)" type="number" min={1} defaultValue={produto.prazoMax} className="mt-0" />
        </div>
      </Secao>

      <Secao
        titulo="O que a cliente escolhe"
        descricao="Marque os grupos que esta peça aceita e, dentro de cada um, só os valores que ela realmente tem. Uma cor desligada nas “Cores e opções” não aparece aqui."
      >
        {grupos.map((g) => {
          const escolhido = escolhas.get(g.id);
          return (
            <div key={g.id} className="mt-bloco rounded-card border border-borda p-4 first:mt-0">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="grupo"
                  value={g.id}
                  checked={Boolean(escolhido)}
                  onChange={(e) => alternarGrupo(g.id, e.target.checked)}
                  className="size-5 accent-verde-cristal"
                />
                <span className="font-medium">{g.nome}</span>
                <span className="text-legenda text-conteudo-suave">
                  {g.tipo === "TEXT" ? "texto livre" : `${g.valores.length} valores`}
                </span>
              </label>

              {escolhido ? (
                <div className="mt-4 pl-8">
                  <label className="flex items-center gap-2 text-apoio">
                    <input
                      type="checkbox"
                      name={`obrigatorio-${g.id}`}
                      defaultChecked={escolhido.obrigatorio}
                      className="size-4 accent-verde-cristal"
                    />
                    Escolha obrigatória
                  </label>

                  {g.tipo !== "TEXT" ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {g.valores.map((v) => {
                        const marcado = escolhido.valores.has(v.id);
                        return (
                          <li key={v.id}>
                            <label
                              className={`inline-flex cursor-pointer items-center gap-2 rounded-fio border px-3 py-2 text-apoio transition-colors ${
                                marcado
                                  ? "border-conteudo bg-superficie-baixa"
                                  : "border-borda hover:bg-superficie-baixa"
                              }`}
                            >
                              <input
                                type="checkbox"
                                name={`valor-${g.id}`}
                                value={v.id}
                                checked={marcado}
                                onChange={(e) => alternarValor(g.id, v.id, e.target.checked)}
                                className="sr-only"
                              />
                              {v.hex ? (
                                <span
                                  className="size-4 rounded-pilula border border-borda-forte/40"
                                  style={{ backgroundColor: v.hex }}
                                />
                              ) : null}
                              {v.nome}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </Secao>

      <Secao titulo="Vitrine e publicação">
        <Marcador
          id="featured"
          rotulo="Mostrar em destaque na home"
          checked={destaque}
          onChange={(e) => setDestaque(e.target.checked)}
        />
        {destaque ? (
          <Campo
            id="featuredPosition"
            rotulo="Ordem no destaque"
            dica="Menor aparece primeiro."
            type="number"
            min={0}
            defaultValue={produto.posicaoDeDestaque || "0"}
          />
        ) : null}

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
