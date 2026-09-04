"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { gerarSlug } from "@/lib/admin/slug";
import { revalidarCatalogo } from "@/lib/revalidar";

export type Resultado = { erro?: string; ok?: string };

const HEX = /^#[0-9a-fA-F]{6}$/;

const esquemaDeValor = z.object({
  name: z.string().trim().min(1, "Dê um nome ao valor."),
  hex: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v.toUpperCase()))
    .refine((v) => v === null || HEX.test(v), {
      message: "A cor precisa estar no formato #RRGGBB.",
    }),
  yarnLine: z.string().trim().transform((v) => (v === "" ? null : v)),
  yarnColorCode: z.string().trim().transform((v) => (v === "" ? null : v)),
});

export async function salvarValor(_anterior: unknown, dados: FormData): Promise<Resultado> {
  await exigirSessao();

  const groupId = String(dados.get("groupId") ?? "");
  const id = String(dados.get("id") ?? "");
  const analise = esquemaDeValor.safeParse(Object.fromEntries(dados.entries()));
  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }
  const v = analise.data;

  if (id) {
    await db.optionValue.update({ where: { id }, data: v });
  } else {
    if (!groupId) return { erro: "Grupo não encontrado." };
    const slug = gerarSlug(v.name) || `valor-${Date.now()}`;
    const jaExiste = await db.optionValue.findUnique({
      where: { groupId_slug: { groupId, slug } },
      select: { id: true },
    });
    if (jaExiste) return { erro: `Já existe um valor chamado “${v.name}” neste grupo.` };

    const total = await db.optionValue.count({ where: { groupId } });
    await db.optionValue.create({ data: { ...v, groupId, slug, position: total } });
  }

  revalidarCatalogo();
  return { ok: "Salvo." };
}

/**
 * Troca o valor de lugar com o vizinho, dentro do mesmo grupo.
 *
 * A ordem não é enfeite de painel: ela decide **quais cores aparecem na
 * primeira dobra do site** (o hero mostra as 8 primeiras), em que sequência a
 * cliente vê as opções na página da peça e como o filtro do catálogo se
 * organiza. Sem isto, a ordem era a de cadastro e não dava para mudar.
 */
export async function moverValor(id: string, direcao: -1 | 1) {
  await exigirSessao();

  const atual = await db.optionValue.findUnique({ where: { id } });
  if (!atual) return;

  const vizinho = await db.optionValue.findFirst({
    where: {
      groupId: atual.groupId,
      position: direcao === -1 ? { lt: atual.position } : { gt: atual.position },
    },
    orderBy: { position: direcao === -1 ? "desc" : "asc" },
  });
  if (!vizinho) return;

  await db.$transaction([
    db.optionValue.update({ where: { id: atual.id }, data: { position: vizinho.position } }),
    db.optionValue.update({ where: { id: vizinho.id }, data: { position: atual.position } }),
  ]);

  revalidarCatalogo();
}

export async function alternarValor(id: string, ativo: boolean) {
  await exigirSessao();
  await db.optionValue.update({ where: { id }, data: { active: ativo } });
  revalidarCatalogo();
}

export async function apagarValor(id: string): Promise<Resultado> {
  await exigirSessao();

  // Apagar remove o valor de todas as peças que o usavam. Desligar é quase
  // sempre o que ela quer, então o caminho destrutivo só passa se ninguém
  // estiver usando.
  const emUso = await db.productOptionValue.count({ where: { optionValueId: id } });
  if (emUso > 0) {
    return {
      erro: `Este valor está em ${emUso} ${emUso === 1 ? "peça" : "peças"}. Desligue em vez de apagar — assim ele some do site mas as peças não perdem o vínculo.`,
    };
  }

  await db.optionValue.delete({ where: { id } });
  revalidarCatalogo();
  return { ok: "Valor apagado." };
}

export async function alternarGrupo(id: string, ativo: boolean) {
  await exigirSessao();
  await db.optionGroup.update({ where: { id }, data: { active: ativo } });
  revalidarCatalogo();
}

export async function criarGrupo(_anterior: unknown, dados: FormData): Promise<Resultado> {
  await exigirSessao();
  const nome = String(dados.get("name") ?? "").trim();
  const tipo = String(dados.get("type") ?? "SINGLE");
  if (nome.length < 2) return { erro: "Dê um nome ao grupo." };
  if (!["SINGLE", "MULTIPLE", "TEXT"].includes(tipo)) return { erro: "Tipo inválido." };

  const slug = gerarSlug(nome);
  const existe = await db.optionGroup.findUnique({ where: { slug }, select: { id: true } });
  if (existe) return { erro: `Já existe um grupo chamado “${nome}”.` };

  const total = await db.optionGroup.count();
  await db.optionGroup.create({
    data: { slug, name: nome, type: tipo as "SINGLE" | "MULTIPLE" | "TEXT", position: total },
  });

  revalidarCatalogo();
  return { ok: "Grupo criado." };
}
