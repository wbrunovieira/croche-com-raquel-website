"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { criarProduto } from "../acoes";
import { ImagePlus, X } from "lucide-react";
import { AreaDeTexto, Campo, Marcador, Selecao } from "@/components/admin/campos";
import { classesDeBotao } from "@/components/ui/botao";
import { emMB, prepararFoto, type FotoPreparada } from "@/lib/imagem";

export function FormularioDeNovaPeca({
  categorias,
}: {
  categorias: { id: string; nome: string }[];
}) {
  const [estado, acao, pendente] = useActionState(criarProduto, null);
  const [fotos, setFotos] = useState<FotoPreparada[]>([]);

  /**
   * Os campos são controlados de propósito.
   *
   * O React 19 **limpa o formulário sozinho** quando uma ação passada em
   * `<form action>` termina — inclusive quando ela termina em erro. Ela
   * digitava nome, categoria, descrição e preço, esbarrava numa regra ("para
   * entrar no ar, escolha uma foto") e recebia de volta o formulário VAZIO,
   * com o aviso em cima. Perder o que se escreveu por causa de um aviso é o
   * tipo de coisa que faz alguém desistir do painel.
   *
   * Controlar os campos sozinho não bastava: o reset mexe no DOM, e num
   * `<select>` cujo valor de estado não mudou o React não reescreve o
   * elemento — a categoria voltava em branco mesmo com o estado certo. Por
   * isso o envio também deixou de usar `action` e passa por `onSubmit`, que
   * não dispara reset nenhum.
   */
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [destaque, setDestaque] = useState(false);
  /**
   * Nasce **ativo**: quem entra em "Nova peça" está cadastrando algo para
   * aparecer no site, e obrigar um clique a mais para o caso comum é atrito
   * sem contrapartida. Desativado continua a um clique, para quem quer deixar
   * a peça pronta e publicar depois.
   */
  const [situacao, setSituacao] = useState("PUBLISHED");
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
    <form
      // `onSubmit` em vez de `action`: é o que impede o React de limpar o
      // formulário quando a ação volta com aviso. O `FormData` sai do próprio
      // formulário, então o `input` de arquivo entra junto sem trabalho extra.
      onSubmit={(e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        startTransition(() => acao(dados));
      }}
    >
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
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <Selecao
        id="categoryId"
        rotulo="Categoria"
        required
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      >
        <option value="" disabled>
          Escolha…
        </option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </Selecao>

      <AreaDeTexto
        id="description"
        rotulo="Descrição"
        dica="É o texto que aparece na página da peça. Escreva como você contaria para uma cliente."
        rows={4}
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

      <Campo
        id="price"
        rotulo="Preço"
        dica="Deixe em branco para a peça aparecer como “sob consulta”. Nunca coloque 0."
        inputMode="decimal"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
      />

      {/* A foto vem no mesmo formulário: era ela que sobrava na segunda tela, e
          uma peça sem foto não vai ao ar. Por dentro continua sendo
          criar-depois-subir — o arquivo vai para `produtos/<slug>/` e o caminho
          precisa do slug —, mas para ela é um botão só. */}
      <div className="mt-bloco">
        <span className="block text-apoio font-medium">Fotos</span>
        <span className="mt-1 block text-legenda text-conteudo-suave">
          Uma foto já basta para a peça ir ao ar. Se escolher mais de uma, a
          primeira é a capa — e a ordem você ajusta depois.
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

      <div className="mt-bloco">
        <Marcador
          id="featured"
          rotulo="Mostrar em destaque na home"
          checked={destaque}
          onChange={(e) => setDestaque(e.target.checked)}
        />
      </div>

      <Selecao
        id="status"
        rotulo="Situação"
        dica="Ativa, a peça aparece no site — para isso ela precisa de foto e descrição. Desativada, fica só aqui no painel."
        value={situacao}
        onChange={(e) => setSituacao(e.target.value)}
      >
        <option value="PUBLISHED">Ativo</option>
        <option value="DRAFT">Desativado</option>
      </Selecao>

      <button
        type="submit"
        disabled={pendente || preparando}
        className={`${classesDeBotao()} mt-bloco`}
      >
        {pendente ? (fotos.length > 0 ? "Enviando as fotos…" : "Salvando…") : "Criar peça"}
      </button>
    </form>
  );
}
