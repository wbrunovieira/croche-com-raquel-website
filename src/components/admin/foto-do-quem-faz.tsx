"use client";

import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";
import { Trash2, Upload } from "lucide-react";
import { apagarFotoDoQuemFaz, enviarFotoDoQuemFaz } from "@/app/admin/acoes-de-conteudo";
import { classesDeBotao } from "@/components/ui/botao";

/**
 * Foto da faixa verde da home.
 *
 * É uma só, e trocar substitui a anterior — por isso não há lista nem ordem
 * aqui, ao contrário das fotos de peça. O envio acontece na hora de escolher,
 * não ao salvar o formulário, para ela ver o resultado antes de continuar.
 */
export function FotoDoQuemFaz({ url }: { url: string | null }) {
  const [estado, acaoDeEnvio, enviando] = useActionState(enviarFotoDoQuemFaz, null);
  const [pendente, iniciar] = useTransition();
  const formulario = useRef<HTMLFormElement>(null);
  const [nomeDoArquivo, setNomeDoArquivo] = useState<string | null>(null);

  return (
    <div>
      {url ? (
        <div className="flex items-start gap-4">
          <span className="relative block aspect-peca w-32 shrink-0 overflow-hidden rounded-fio bg-superficie-baixa">
            <Image src={url} alt="" fill sizes="128px" className="object-cover" />
          </span>
          <button
            type="button"
            disabled={pendente}
            onClick={() => iniciar(() => apagarFotoDoQuemFaz())}
            className={classesDeBotao("secundaria", "sm")}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Remover foto
          </button>
        </div>
      ) : (
        <p className="text-apoio text-conteudo-suave">
          Sem foto — a faixa verde da home fica só com o texto.
        </p>
      )}

      <form ref={formulario} action={acaoDeEnvio} className="mt-4">
        <label className={`${classesDeBotao("secundaria", "sm")} cursor-pointer`}>
          <Upload className="size-4" aria-hidden="true" />
          {url ? "Trocar a foto" : "Escolher a foto"}
          <input
            type="file"
            name="arquivo"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => {
              setNomeDoArquivo(e.target.files?.[0]?.name ?? null);
              formulario.current?.requestSubmit();
            }}
          />
        </label>
        {enviando ? (
          <span className="ml-3 text-apoio text-conteudo-suave">
            Enviando {nomeDoArquivo}…
          </span>
        ) : null}
      </form>

      {estado?.erro ? <p className="mt-3 text-apoio text-erro">{estado.erro}</p> : null}
      {estado?.ok ? <p className="mt-3 text-apoio text-conteudo-suave">{estado.ok}</p> : null}
    </div>
  );
}
