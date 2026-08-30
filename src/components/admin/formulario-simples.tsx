"use client";

import { useActionState } from "react";
import { classesDeBotao } from "@/components/ui/botao";

type Acao = (anterior: unknown, dados: FormData) => Promise<{ erro?: string; ok?: string }>;

/**
 * Casca de formulário do painel: cuida do estado da ação, da mensagem de erro
 * e do botão. As telas só descrevem os campos.
 */
export function FormularioSimples({
  acao,
  children,
  rotulo = "Salvar",
  className = "",
}: {
  acao: Acao;
  children: React.ReactNode;
  rotulo?: string;
  className?: string;
}) {
  const [estado, executar, pendente] = useActionState(acao, null);

  return (
    <form action={executar} className={className}>
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

      {children}

      <button type="submit" disabled={pendente} className={`${classesDeBotao()} mt-bloco`}>
        {pendente ? "Salvando…" : rotulo}
      </button>
    </form>
  );
}

export function BotaoDeApagar({
  aoConfirmar,
  pergunta,
  rotulo = "Apagar",
}: {
  aoConfirmar: () => void;
  pergunta: string;
  rotulo?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm(pergunta)) aoConfirmar();
      }}
      className="py-2 text-apoio text-erro underline underline-offset-4 hover:no-underline"
    >
      {rotulo}
    </button>
  );
}
