"use client";

import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Trash2, Upload, UserRound } from "lucide-react";
import {
  alternarEscalaHumana,
  apagarImagem,
  enviarImagem,
  moverImagem,
} from "@/app/admin/produtos/acoes";
import { classesDeBotao } from "@/components/ui/botao";

export type ImagemDoAdmin = {
  id: string;
  url: string;
  alt: string;
  temEscalaHumana: boolean;
};

/**
 * Fotos da peça.
 *
 * O envio acontece na hora, não ao salvar o formulário: a Raquel escolhe a
 * foto e vê a foto. Guardar o arquivo em memória até o submit faria ela
 * perder o envio se algo desse errado no resto do formulário.
 *
 * A primeira foto da lista é a capa — está escrito na tela, porque "a ordem
 * define a capa" não é óbvio para quem nunca mexeu num painel.
 */
export function ImagensDoProduto({
  productId,
  imagens,
  ehBolsa,
}: {
  productId: string;
  imagens: ImagemDoAdmin[];
  ehBolsa: boolean;
}) {
  const [estado, acaoDeEnvio, enviando] = useActionState(enviarImagem, null);
  const [pendente, iniciar] = useTransition();
  const formulario = useRef<HTMLFormElement>(null);
  const [nomeDoArquivo, setNomeDoArquivo] = useState<string | null>(null);

  const faltaEscalaHumana = ehBolsa && !imagens.some((i) => i.temEscalaHumana);

  return (
    <div>
      {imagens.length === 0 ? (
        <p className="text-apoio text-conteudo-suave">
          Nenhuma foto ainda. A peça não pode ir ao ar sem pelo menos uma.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {imagens.map((img, i) => (
            <li key={img.id} className="rounded-card border border-borda bg-superficie p-3">
              <span className="relative block aspect-peca w-full overflow-hidden rounded-fio bg-superficie-baixa">
                <Image src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" />
                {i === 0 ? (
                  <span className="absolute left-2 top-2 rounded-fio bg-primaria px-2 py-1 text-etiqueta uppercase text-sobre-primaria">
                    Capa
                  </span>
                ) : null}
              </span>

              <div className="mt-3 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <BotaoDeIcone
                    rotulo="Mover para a esquerda"
                    desabilitado={i === 0 || pendente}
                    aoClicar={() => iniciar(() => moverImagem(img.id, -1))}
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </BotaoDeIcone>
                  <BotaoDeIcone
                    rotulo="Mover para a direita"
                    desabilitado={i === imagens.length - 1 || pendente}
                    aoClicar={() => iniciar(() => moverImagem(img.id, 1))}
                  >
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </BotaoDeIcone>
                </div>
                <BotaoDeIcone
                  rotulo="Apagar foto"
                  desabilitado={pendente}
                  aoClicar={() => {
                    if (confirm("Apagar esta foto? Não dá para desfazer.")) {
                      iniciar(() => apagarImagem(img.id));
                    }
                  }}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </BotaoDeIcone>
              </div>

              <label className="mt-3 flex cursor-pointer items-start gap-2 text-legenda">
                <input
                  type="checkbox"
                  checked={img.temEscalaHumana}
                  disabled={pendente}
                  onChange={(e) =>
                    iniciar(() => alternarEscalaHumana(img.id, e.target.checked))
                  }
                  className="mt-0.5 size-4 shrink-0 accent-verde-cristal"
                />
                <span className="text-conteudo-suave">Alguém usando a peça</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {faltaEscalaHumana ? (
        <p className="mt-bloco flex items-start gap-2 rounded-fio bg-goiaba-clara px-4 py-3 text-apoio">
          <UserRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Falta uma foto com alguém usando a bolsa. Foto de bolsa solta não
          mostra o tamanho, e é a pergunta que mais chega no WhatsApp.
        </p>
      ) : null}

      <form ref={formulario} action={acaoDeEnvio} className="mt-bloco">
        <input type="hidden" name="productId" value={productId} />

        {estado?.erro ? (
          <p role="alert" className="mb-4 rounded-fio bg-goiaba-clara px-4 py-3 text-apoio">
            {estado.erro}
          </p>
        ) : null}

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="arquivo" className={`${classesDeBotao("secundaria")} cursor-pointer`}>
              <Upload className="size-5" aria-hidden="true" />
              {nomeDoArquivo ?? "Escolher foto"}
            </label>
            <input
              id="arquivo"
              name="arquivo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(e) => {
                setNomeDoArquivo(e.target.files?.[0]?.name ?? null);
                // Envia assim que a foto é escolhida: um segundo clique em
                // "enviar" só criaria um passo a mais para errar.
                if (e.target.files?.length) formulario.current?.requestSubmit();
              }}
            />
          </div>
          <p className="text-legenda text-conteudo-suave">
            JPG, PNG, WebP ou AVIF, até 15 MB. {enviando ? "Enviando…" : ""}
          </p>
        </div>
      </form>
    </div>
  );
}

function BotaoDeIcone({
  rotulo,
  desabilitado,
  aoClicar,
  children,
}: {
  rotulo: string;
  desabilitado: boolean;
  aoClicar: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={rotulo}
      aria-label={rotulo}
      disabled={desabilitado}
      onClick={aoClicar}
      className="rounded-fio border border-borda-forte p-2 transition-colors hover:bg-superficie-baixa disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
