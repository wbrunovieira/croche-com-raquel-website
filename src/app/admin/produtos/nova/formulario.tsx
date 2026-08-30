"use client";

import { useActionState } from "react";
import { criarProduto } from "../acoes";
import { Campo, Selecao } from "@/components/admin/campos";
import { classesDeBotao } from "@/components/ui/botao";

export function FormularioDeNovaPeca({
  categorias,
}: {
  categorias: { id: string; nome: string }[];
}) {
  const [estado, acao, pendente] = useActionState(criarProduto, null);

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

      <button type="submit" disabled={pendente} className={`${classesDeBotao()} mt-bloco`}>
        {pendente ? "Criando…" : "Criar rascunho"}
      </button>
    </form>
  );
}
