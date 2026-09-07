"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { criarProduto } from "../acoes";
import { ImagePlus, X } from "lucide-react";
import { Campo, Selecao } from "@/components/admin/campos";
import { classesDeBotao } from "@/components/ui/botao";
import { emMB, prepararFoto, type FotoPreparada } from "@/lib/imagem";

export function FormularioDeNovaPeca({
  categorias,
}: {
  categorias: { id: string; nome: string }[];
}) {
  const [estado, acao, pendente] = useActionState(criarProduto, null);
  const [fotos, setFotos] = useState<FotoPreparada[]>([]);
  const [preparando, setPreparando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const entrada = useRef<HTMLInputElement>(null);

  // As URLs de objeto das miniaturas seguram os bytes da foto em memória até
  // serem revogadas. Sem isto, escolher e trocar a seleção algumas vezes
  // acumula dezenas de megabytes no navegador dela.
  useEffect(() => () => fotos.forEach((f) => URL.revokeObjectURL(f.previa)), [fotos]);

  /**
   * Reduz as fotos e devolve os arquivos reduzidos para o próprio `input`.
   *
   * A troca acontece via `DataTransfer` para o formulário continuar sendo um
   * formulário: o envio segue pelo `action` normal, sem `FormData` montado na
   * mão, e o que sobe é o arquivo pequeno — não o de 2,6 MB que o celular dela
   * produziu, que estourava o limite de corpo do Server Action.
   */
  async function aoEscolher(lista: FileList | null) {
    const escolhidas = Array.from(lista ?? []);
    if (escolhidas.length === 0) return;

    setPreparando(true);
    setAviso(null);
    fotos.forEach((f) => URL.revokeObjectURL(f.previa));

    try {
      const preparadas = await Promise.all(escolhidas.map(prepararFoto));
      const balde = new DataTransfer();
      preparadas.forEach((f) => balde.items.add(f.arquivo));
      if (entrada.current) entrada.current.files = balde.files;
      setFotos(preparadas);
    } catch {
      setFotos([]);
      if (entrada.current) entrada.current.value = "";
      setAviso("Não consegui ler essa foto. Tente outra, ou um JPG.");
    } finally {
      setPreparando(false);
    }
  }

  function remover(indice: number) {
    const restantes = fotos.filter((_, i) => i !== indice);
    URL.revokeObjectURL(fotos[indice].previa);
    const balde = new DataTransfer();
    restantes.forEach((f) => balde.items.add(f.arquivo));
    if (entrada.current) entrada.current.files = balde.files;
    setFotos(restantes);
  }

  const economizou = fotos.reduce((s, f) => s + (f.antes - f.depois), 0);

  return (
    <form action={acao}>
      {estado?.erro ? (
        <p role="alert" className="mb-bloco rounded-fio bg-goiaba-clara px-4 py-3 text-apoio">
          {estado.erro}
        </p>
      ) : null}

      <Campo id="name" rotulo="Nome da peça" placeholder="Bolsa Serra" required autoFocus />

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
          {fotos.length > 0 ? "Trocar as fotos" : "Escolher fotos"}
          <input
            ref={entrada}
            type="file"
            name="fotos"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => aoEscolher(e.target.files)}
          />
        </label>

        {preparando ? (
          <p role="status" className="mt-3 text-legenda text-conteudo-suave">
            Preparando as fotos…
          </p>
        ) : null}

        {aviso ? (
          <p role="alert" className="mt-3 text-legenda text-primaria">
            {aviso}
          </p>
        ) : null}

        {/* Miniatura, e não o nome do arquivo: "IMG_6926.PNG" não diz nada
            sobre qual bolsa é. Quem escolhe cinco fotos parecidas precisa ver
            qual entrou como capa antes de criar a peça. */}
        {fotos.length > 0 ? (
          <>
            <ul className="mt-4 flex flex-wrap gap-3">
              {fotos.map((foto, i) => (
                <li key={foto.previa} className="relative">
                  <div className="relative size-24 overflow-hidden rounded-fio border border-borda bg-superficie">
                    <Image
                      src={foto.previa}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {i === 0 ? (
                    <span className="absolute left-1 top-1 rounded-fio bg-tinta/80 px-1.5 py-0.5 text-legenda text-cru">
                      capa
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => remover(i)}
                    aria-label={`Tirar a foto ${i + 1}`}
                    className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-pilula border border-borda bg-superficie text-conteudo-suave transition-colors hover:text-conteudo"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            {economizou > 0 ? (
              <p className="mt-3 text-legenda text-conteudo-suave">
                {fotos.length === 1 ? "Foto reduzida" : `${fotos.length} fotos reduzidas`} para
                enviar mais rápido — {emMB(economizou)} a menos.
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pendente || preparando}
        className={`${classesDeBotao()} mt-bloco`}
      >
        {pendente ? (fotos.length > 0 ? "Enviando as fotos…" : "Criando…") : "Criar peça"}
      </button>
    </form>
  );
}
