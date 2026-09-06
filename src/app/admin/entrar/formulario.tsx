"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { classesDeBotao } from "@/components/ui/botao";

export function FormularioDeEntrada({
  acao,
  erro,
}: {
  acao: (dados: FormData) => Promise<void>;
  erro: boolean;
}) {
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const campo =
    "h-controle w-full rounded-fio border border-borda-forte bg-superficie px-campo-x text-base";

  return (
    <form action={acao}>
      {erro ? (
        // Mensagem única de propósito: dizer "usuário não existe" contaria a
        // quem tenta invadir quais usuários estão cadastrados.
        <p role="alert" className="mb-bloco rounded-fio bg-goiaba-clara px-4 py-3 text-apoio">
          Usuário ou senha incorretos.
        </p>
      ) : null}

      <label htmlFor="usuario" className="block text-apoio font-medium">
        Usuário
      </label>
      <input
        id="usuario"
        name="usuario"
        type="text"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        required
        className={`${campo} mt-2`}
      />

      <label htmlFor="senha" className="mt-bloco block text-apoio font-medium">
        Senha
      </label>
      {/* Mostrar a senha não é conveniência: senha com maiúscula, número e
          símbolo se erra no escuro, e quem erra três vezes desiste. O botão
          fica dentro do campo, com área de toque de 44px (WCAG 2.5.5), e
          `type="button"` para não enviar o formulário sem querer. */}
      <div className="relative mt-2">
        <input
          id="senha"
          name="senha"
          type={senhaVisivel ? "text" : "password"}
          autoComplete="current-password"
          required
          className={`${campo} pr-controle`}
        />
        <button
          type="button"
          onClick={() => setSenhaVisivel((v) => !v)}
          aria-label={senhaVisivel ? "Esconder a senha" : "Mostrar a senha"}
          aria-pressed={senhaVisivel}
          className="absolute inset-y-0 right-0 grid w-controle place-items-center text-conteudo-suave transition-colors hover:text-conteudo"
        >
          {senhaVisivel ? (
            <EyeOff className="size-5" aria-hidden="true" />
          ) : (
            <Eye className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

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
