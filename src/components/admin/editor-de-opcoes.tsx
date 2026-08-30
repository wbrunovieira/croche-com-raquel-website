"use client";

import { useActionState, useState, useTransition } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";
import {
  alternarGrupo,
  alternarValor,
  apagarValor,
  criarGrupo,
  salvarValor,
} from "@/app/admin/opcoes/acoes";
import { classesDeBotao } from "@/components/ui/botao";
import { Campo, Selecao } from "@/components/admin/campos";

export type ValorDoAdmin = {
  id: string;
  nome: string;
  hex: string | null;
  linhaDoFio: string | null;
  codigoDaCor: string | null;
  ativo: boolean;
  emUso: number;
};

export type GrupoDoAdmin = {
  id: string;
  nome: string;
  slug: string;
  tipo: "SINGLE" | "MULTIPLE" | "TEXT";
  ativo: boolean;
  valores: ValorDoAdmin[];
};

export function EditorDeOpcoes({ grupos }: { grupos: GrupoDoAdmin[] }) {
  return (
    <div className="space-y-respiro">
      {grupos.map((g) => (
        <Grupo key={g.id} grupo={g} />
      ))}
      <NovoGrupo />
    </div>
  );
}

function Grupo({ grupo }: { grupo: GrupoDoAdmin }) {
  const [pendente, iniciar] = useTransition();
  const [novo, setNovo] = useState(false);
  const ehCor = grupo.slug === "cor";

  return (
    <section
      className={`rounded-card border border-borda bg-superficie p-painel ${
        grupo.ativo ? "" : "opacity-60"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-t3">{grupo.nome}</h2>
          <p className="mt-1 text-apoio text-conteudo-suave">
            {grupo.tipo === "TEXT"
              ? "A cliente digita — nome, monograma."
              : `${grupo.valores.length} ${grupo.valores.length === 1 ? "valor" : "valores"}`}
            {grupo.ativo ? "" : " · grupo desligado, não aparece no site"}
          </p>
        </div>
        <button
          type="button"
          disabled={pendente}
          onClick={() => iniciar(() => alternarGrupo(grupo.id, !grupo.ativo))}
          className={classesDeBotao("secundaria", "sm")}
        >
          {grupo.ativo ? "Desligar grupo" : "Religar grupo"}
        </button>
      </div>

      {grupo.tipo !== "TEXT" ? (
        <>
          <ul className="mt-bloco space-y-3">
            {grupo.valores.map((v) => (
              <Valor key={v.id} valor={v} grupoId={grupo.id} ehCor={ehCor} />
            ))}
          </ul>

          {novo ? (
            <div className="mt-bloco">
              <FormularioDeValor
                grupoId={grupo.id}
                ehCor={ehCor}
                aoFechar={() => setNovo(false)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setNovo(true)}
              className={`${classesDeBotao("secundaria", "sm")} mt-bloco`}
            >
              <Plus className="size-4" aria-hidden="true" />
              {ehCor ? "Nova cor" : "Novo valor"}
            </button>
          )}
        </>
      ) : null}
    </section>
  );
}

function Valor({
  valor,
  grupoId,
  ehCor,
}: {
  valor: ValorDoAdmin;
  grupoId: string;
  ehCor: boolean;
}) {
  const [pendente, iniciar] = useTransition();
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (editando) {
    return (
      <li>
        <FormularioDeValor
          grupoId={grupoId}
          ehCor={ehCor}
          valor={valor}
          aoFechar={() => setEditando(false)}
        />
      </li>
    );
  }

  return (
    <li
      className={`flex flex-wrap items-center gap-4 rounded-fio border border-borda p-3 ${
        valor.ativo ? "" : "opacity-55"
      }`}
    >
      {valor.hex ? (
        <span
          className="size-controle-sm shrink-0 rounded-pilula border border-borda-forte/40"
          style={{ backgroundColor: valor.hex }}
          aria-hidden="true"
        />
      ) : null}

      <span className="min-w-0 flex-1">
        <span className="block font-medium">{valor.nome}</span>
        <span className="mt-0.5 block text-legenda text-conteudo-suave">
          {[
            valor.linhaDoFio,
            valor.codigoDaCor ? `cor ${valor.codigoDaCor}` : null,
            `${valor.emUso} ${valor.emUso === 1 ? "peça" : "peças"}`,
            valor.ativo ? null : "desligado",
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setEditando(true)}
          className={classesDeBotao("secundaria", "sm")}
        >
          Editar
        </button>
        <button
          type="button"
          disabled={pendente}
          onClick={() => iniciar(() => alternarValor(valor.id, !valor.ativo))}
          className={classesDeBotao("secundaria", "sm")}
        >
          {valor.ativo ? (
            <>
              <X className="size-4" aria-hidden="true" />
              Desligar
            </>
          ) : (
            <>
              <Check className="size-4" aria-hidden="true" />
              Religar
            </>
          )}
        </button>
        <button
          type="button"
          disabled={pendente}
          aria-label={`Apagar ${valor.nome}`}
          onClick={() =>
            iniciar(async () => {
              const r = await apagarValor(valor.id);
              setErro(r.erro ?? null);
            })
          }
          className="rounded-fio border border-borda-forte p-2 text-erro transition-colors hover:bg-superficie-baixa"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </span>

      {erro ? (
        <p role="alert" className="w-full rounded-fio bg-goiaba-clara px-3 py-2 text-legenda">
          {erro}
        </p>
      ) : null}
    </li>
  );
}

function FormularioDeValor({
  grupoId,
  ehCor,
  valor,
  aoFechar,
}: {
  grupoId: string;
  ehCor: boolean;
  valor?: ValorDoAdmin;
  aoFechar: () => void;
}) {
  const [estado, acao, salvando] = useActionState(salvarValor, null);
  const [hex, setHex] = useState(valor?.hex ?? "#B05A3C");

  return (
    <form
      action={acao}
      className="rounded-card border border-borda-forte bg-superficie-baixa p-painel"
    >
      <input type="hidden" name="groupId" value={grupoId} />
      {valor ? <input type="hidden" name="id" value={valor.id} /> : null}

      {estado?.erro ? (
        <p role="alert" className="mb-4 rounded-fio bg-goiaba-clara px-3 py-2 text-apoio">
          {estado.erro}
        </p>
      ) : null}

      <div className="flex flex-wrap items-end gap-6">
        {ehCor ? (
          <div>
            <label htmlFor={`roda-${grupoId}-${valor?.id ?? "novo"}`} className="mb-1 block text-apoio text-conteudo-suave">
              Roda de cores
            </label>
            <input
              id={`roda-${grupoId}-${valor?.id ?? "novo"}`}
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value.toUpperCase())}
              className="size-20 cursor-pointer rounded-card border border-borda-forte bg-transparent p-1"
            />
          </div>
        ) : null}

        <div className="min-w-52 flex-1">
          <Campo
            id="name"
            rotulo="Nome"
            defaultValue={valor?.nome}
            placeholder={ehCor ? "Terracota" : "P"}
            required
            className="mt-0"
          />
        </div>

        {ehCor ? (
          <div className="min-w-40">
            <Campo
              id="hex"
              rotulo="Código da tela"
              value={hex}
              onChange={(e) => setHex(e.target.value.toUpperCase())}
              className="mt-0 font-mono uppercase"
            />
          </div>
        ) : (
          <input type="hidden" name="hex" value="" />
        )}
      </div>

      {ehCor ? (
        <div className="mt-bloco">
          <p className="text-apoio text-conteudo-suave">
            Ficha do fio — é por ela que você recompra e garante que a peça nova
            sai igual à da foto.
          </p>
          <div className="mt-4 flex flex-wrap gap-6">
            <div className="min-w-52 flex-1">
              <Campo
                id="yarnLine"
                rotulo="Linha do fio"
                placeholder="Barroco Maxcolor 400g"
                defaultValue={valor?.linhaDoFio ?? ""}
                className="mt-0"
              />
            </div>
            <div className="min-w-40">
              <Campo
                id="yarnColorCode"
                rotulo="Código da cor"
                placeholder="7684"
                defaultValue={valor?.codigoDaCor ?? ""}
                className="mt-0 tabular"
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <input type="hidden" name="yarnLine" value="" />
          <input type="hidden" name="yarnColorCode" value="" />
        </>
      )}

      <div className="mt-bloco flex flex-wrap gap-3">
        <button type="submit" disabled={salvando} className={classesDeBotao("primaria", "sm")}>
          {salvando ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={aoFechar}
          className={classesDeBotao("secundaria", "sm")}
        >
          {estado?.ok ? "Fechar" : "Cancelar"}
        </button>
        {estado?.ok ? (
          <span role="status" className="self-center text-apoio text-conteudo-suave">
            {estado.ok} Feche para ver na lista.
          </span>
        ) : null}
      </div>
    </form>
  );
}

function NovoGrupo() {
  const [estado, acao, salvando] = useActionState(criarGrupo, null);
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={classesDeBotao("secundaria")}
      >
        <Plus className="size-5" aria-hidden="true" />
        Novo grupo de opção
      </button>
    );
  }

  return (
    <form action={acao} className="rounded-card border border-borda bg-superficie p-painel">
      <h2 className="font-display text-t3">Novo grupo</h2>
      {estado?.erro ? (
        <p role="alert" className="mt-4 rounded-fio bg-goiaba-clara px-3 py-2 text-apoio">
          {estado.erro}
        </p>
      ) : null}
      <Campo id="name" rotulo="Nome" placeholder="Bordado" required />
      <Selecao
        id="type"
        rotulo="Como a cliente responde"
        dica="Uma opção: ela escolhe entre valores. Texto livre: ela digita."
        defaultValue="SINGLE"
      >
        <option value="SINGLE">Escolhe uma opção</option>
        <option value="MULTIPLE">Escolhe várias</option>
        <option value="TEXT">Digita um texto</option>
      </Selecao>
      <div className="mt-bloco flex gap-3">
        <button type="submit" disabled={salvando} className={classesDeBotao("primaria", "sm")}>
          {salvando ? "Criando…" : "Criar grupo"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className={classesDeBotao("secundaria", "sm")}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
