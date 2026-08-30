"use client";

import { useFormStatus } from "react-dom";
import { classesDeBotao } from "@/components/ui/botao";

export function FormularioDeEntrada({
  acao,
  erro,
}: {
  acao: (dados: FormData) => Promise<void>;
  erro: boolean;
}) {
  const campo =
    "h-controle w-full rounded-fio border border-borda-forte bg-superficie px-campo-x text-base";

  return (
    <form action={acao}>
      {erro ? (
        // Mensagem única de propósito: dizer "e-mail não existe" contaria a
        // quem tenta invadir quais e-mails estão cadastrados.
        <p role="alert" className="mb-bloco rounded-fio bg-goiaba-clara px-4 py-3 text-apoio">
          E-mail ou senha incorretos.
        </p>
      ) : null}

      <label htmlFor="email" className="block text-apoio font-medium">
        E-mail
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        required
        className={`${campo} mt-2`}
      />

      <label htmlFor="senha" className="mt-bloco block text-apoio font-medium">
        Senha
      </label>
      <input
        id="senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        required
        className={`${campo} mt-2`}
      />

      <div className="mt-bloco">
        <BotaoEnviar />
      </div>
    </form>
  );
}

function BotaoEnviar() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${classesDeBotao()} w-full`}>
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}
