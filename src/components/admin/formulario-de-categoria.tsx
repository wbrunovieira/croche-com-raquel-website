"use client";

import Image from "next/image";
import { startTransition, useActionState, useState } from "react";
import { AreaDeTexto, Campo, Marcador } from "@/components/admin/campos";
import { classesDeBotao } from "@/components/ui/botao";
import { criarCategoria, salvarCategoria } from "@/app/admin/categorias/acoes";

export type PecaParaCapa = {
  id: string;
  nome: string;
  foto: { url: string; alt: string } | null;
  publicada: boolean;
};

export type CategoriaParaEditar = {
  id: string;
  nome: string;
  descricao: string | null;
  textoLongo: string | null;
  posicao: number;
  ativa: boolean;
  capaProdutoId: string | null;
};

/**
 * Cadastro de categoria — o mesmo formulário para criar e para editar.
 *
 * Os campos são controlados pelo mesmo motivo do cadastro de peça: o React 19
 * **limpa o formulário** quando a ação passada em `<form action>` termina,
 * inclusive em erro. E o envio passa por `onSubmit`, não por `action`, porque
 * só assim não há reset nenhum — controlar os campos sozinho não basta num
 * `<select>` cujo valor de estado não mudou.
 */
export function FormularioDeCategoria({
  categoria,
  pecas = [],
}: {
  categoria?: CategoriaParaEditar;
  pecas?: PecaParaCapa[];
}) {
  const acao = categoria
    ? salvarCategoria.bind(null, categoria.id)
    : criarCategoria;
  const [estado, executar, pendente] = useActionState(acao, null);

  const [nome, setNome] = useState(categoria?.nome ?? "");
  const [descricao, setDescricao] = useState(categoria?.descricao ?? "");
  const [textoLongo, setTextoLongo] = useState(categoria?.textoLongo ?? "");
  const [posicao, setPosicao] = useState(String(categoria?.posicao ?? 0));
  const [ativa, setAtiva] = useState(categoria?.ativa ?? true);
  const [capa, setCapa] = useState(categoria?.capaProdutoId ?? "");

  const comFoto = pecas.filter((p) => p.foto);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        startTransition(() => executar(dados));
      }}
    >
      {estado && "erro" in estado && estado.erro ? (
        <p role="alert" className="mb-bloco rounded-fio bg-goiaba-clara px-4 py-3 text-apoio">
          {estado.erro}
        </p>
      ) : null}
      {estado && "ok" in estado && estado.ok ? (
        <p role="status" className="mb-bloco rounded-fio bg-superficie-baixa px-4 py-3 text-apoio">
          {estado.ok}
        </p>
      ) : null}

      <Campo
        id="name"
        rotulo="Nome"
        placeholder="Mesa"
        required
        autoFocus
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        dica={
          categoria
            ? "Trocar o nome não muda o endereço da categoria — os links que você já mandou continuam funcionando."
            : "É como a categoria aparece no menu do catálogo e nos cartões do site."
        }
      />

      <Campo
        id="description"
        rotulo="Uma linha sobre ela"
        placeholder="Sousplat, porta-copos e centro de mesa para deixar a mesa com cara de casa."
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        dica="Aparece abaixo do nome. Deixe em branco se não quiser."
      />

      <AreaDeTexto
        id="longDescription"
        rotulo="Texto longo"
        rows={6}
        value={textoLongo}
        onChange={(e) => setTextoLongo(e.target.value)}
        dica="Opcional. É o texto que ajuda o Google a encontrar a categoria. Linha em branco separa parágrafos."
      />

      {/* A capa só existe na edição: categoria recém-criada não tem peça dentro
          para representá-la. */}
      {categoria ? (
        <div className="mt-bloco">
          <span className="block text-apoio font-medium">Capa da categoria</span>
          <span className="mt-1 block text-legenda text-conteudo-suave">
            Qual peça representa esta categoria na página inicial. Se você não
            escolher, entra a primeira peça ativa — e trocar a foto da peça troca
            a capa junto, sem você precisar voltar aqui.
          </span>

          {comFoto.length === 0 ? (
            <p className="mt-3 text-legenda text-conteudo-suave">
              Nenhuma peça desta categoria tem foto ainda. Cadastre uma peça com
              foto e ela aparece aqui para escolher.
            </p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-3">
              <li>
                <label className="block cursor-pointer text-center">
                  <input
                    type="radio"
                    name="capaProdutoId"
                    value=""
                    checked={capa === ""}
                    onChange={() => setCapa("")}
                    className="sr-only peer"
                  />
                  <span className="grid size-24 place-items-center rounded-fio border border-borda bg-superficie-baixa px-2 text-legenda text-conteudo-suave peer-checked:border-primaria peer-checked:ring-2 peer-checked:ring-primaria/30 peer-focus-visible:ring-2">
                    Escolher por mim
                  </span>
                </label>
              </li>
              {comFoto.map((p) => (
                <li key={p.id}>
                  <label className="block cursor-pointer">
                    <input
                      type="radio"
                      name="capaProdutoId"
                      value={p.id}
                      checked={capa === p.id}
                      onChange={() => setCapa(p.id)}
                      className="sr-only peer"
                    />
                    <span className="relative block size-24 overflow-hidden rounded-fio border border-borda peer-checked:border-primaria peer-checked:ring-2 peer-checked:ring-primaria/30 peer-focus-visible:ring-2">
                      <Image
                        src={p.foto!.url}
                        alt={p.nome}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                      {/* Peça desativada pode ser escolhida, mas não vai ao ar —
                          avisar aqui evita a categoria ficar sem capa em silêncio. */}
                      {!p.publicada ? (
                        <span className="absolute inset-x-0 bottom-0 bg-tinta/80 py-0.5 text-legenda text-cru">
                          desativada
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block max-w-24 truncate text-legenda text-conteudo-suave">
                      {p.nome}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <Campo
        id="position"
        rotulo="Ordem"
        inputMode="numeric"
        value={posicao}
        onChange={(e) => setPosicao(e.target.value)}
        dica="Menor aparece primeiro, no menu e na página inicial."
      />

      <div className="mt-bloco">
        <Marcador
          id="active"
          rotulo="Categoria ativa"
          checked={ativa}
          onChange={(e) => setAtiva(e.target.checked)}
          dica="Desativada, ela some do site e as peças dentro dela continuam aqui no painel."
        />
      </div>

      <button type="submit" disabled={pendente} className={`${classesDeBotao()} mt-bloco`}>
        {pendente ? "Salvando…" : categoria ? "Salvar" : "Criar categoria"}
      </button>
    </form>
  );
}
