"use client";

import { useActionState, useState } from "react";
import { criarProduto } from "../acoes";
import { ImagePlus } from "lucide-react";
import { Campo, Selecao } from "@/components/admin/campos";
import { classesDeBotao } from "@/components/ui/botao";

export function FormularioDeNovaPeca({
  categorias,
}: {
  categorias: { id: string; nome: string }[];
}) {
  const [estado, acao, pendente] = useActionState(criarProduto, null);
  const [escolhidas, setEscolhidas] = useState<string[]>([]);

  return (
    <form action={acao}>
      {estado?.erro ? (
        <p role="alert" className="mb-bloco rounded-fio bg-goiaba-clara px-4 py-3 text-apoio">
          {estado.erro}
        </p>
      ) : null}

      <Campo
        id="name"
        rotulo="Nome da peça"
        placeholder="Bolsa Serra"
        required
        autoFocus
      />

      <Selecao id="categoryId" rotulo="Categoria" required defaultValue="">
        <option value="" disabled>
          Escolha…
        </option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </Selecao>

      {/* Foto já aqui: para quem cadastra, a foto é parte de criar a peça, não
          um segundo passo. Por dentro continua sendo criar-depois-subir — a
          foto vai para `produtos/<slug>/` e precisa do id —, mas ela envia uma
          vez só. Opcional: dá para criar sem foto e adicionar depois; o que
          não dá é ir ao ar sem nenhuma. */}
      <div className="mt-bloco">
        <span className="block text-apoio font-medium">Fotos</span>
        <span className="mt-1 block text-legenda text-conteudo-suave">
          Pode escolher várias de uma vez. A primeira vira a capa — e a ordem
          você ajusta depois.
        </span>
        <label className={`${classesDeBotao("secundaria", "sm")} mt-3 cursor-pointer`}>
          <ImagePlus className="size-4" aria-hidden="true" />
          Escolher fotos
          <input
            type="file"
            name="fotos"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(e) =>
              setEscolhidas(Array.from(e.target.files ?? []).map((f) => f.name))
            }
          />
        </label>
        {escolhidas.length > 0 ? (
          <ul className="mt-3 space-y-1">
            {escolhidas.map((nome, i) => (
              <li key={nome} className="text-legenda text-conteudo-suave">
                {i === 0 ? "capa · " : ""}
                {nome}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <button type="submit" disabled={pendente} className={`${classesDeBotao()} mt-bloco`}>
        {pendente
          ? escolhidas.length > 0
            ? "Enviando as fotos…"
            : "Criando…"
          : "Criar peça"}
      </button>
    </form>
  );
}
