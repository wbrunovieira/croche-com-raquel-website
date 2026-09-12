"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { slugUnico } from "@/lib/admin/slug";
import { revalidarCatalogo } from "@/lib/revalidar";

const esquema = z.object({
  name: z.string().trim().min(2, "O nome precisa de pelo menos 2 letras."),
  description: z.string().trim().max(200, "A descrição é de uma linha — encurte."),
  longDescription: z.string().trim(),
  position: z.coerce.number().int().min(0),
  active: z.coerce.boolean(),
  // "" significa "escolha por mim": a vitrine volta ao automático.
  capaProdutoId: z.string().trim(),
});

function ler(dados: FormData) {
  return esquema.safeParse({
    name: dados.get("name") ?? "",
    description: dados.get("description") ?? "",
    longDescription: dados.get("longDescription") ?? "",
    position: dados.get("position") ?? 0,
    active: dados.get("active") === "on",
    capaProdutoId: dados.get("capaProdutoId") ?? "",
  });
}

/**
 * O slug NÃO é campo de formulário, e isso é decisão de produto.
 *
 * Ele é gerado do nome uma vez, na criação, e nunca mais muda. Duas razões:
 * a Raquel não sabe o que é slug e não deveria precisar saber; e o slug está
 * nas URLs de filtro (`/?categoria=mesa`), que ela manda para clientes pelo
 * WhatsApp. Renomear "Mesa" para "Mesa e Casa" troca o que aparece na tela e
 * deixa o endereço quieto — que é exatamente o comportamento certo.
 *
 * Foi essa a lição da etapa 38: mudar o slug de uma categoria exigiu um script
 * próprio, porque o seed faz `upsert` por slug e a categoria antiga ficava
 * órfã com as peças dentro. O caminho que dá trabalho é o que não deve estar a
 * um clique de distância.
 */
export async function criarCategoria(_anterior: unknown, dados: FormData) {
  await exigirSessao();
  const lido = ler(dados);
  if (!lido.success) {
    return { erro: lido.error.issues[0]?.message ?? "Confira os campos." };
  }
  const v = lido.data;

  const slug = await slugUnico(v.name, async (s) =>
    Boolean(await db.category.findUnique({ where: { slug: s }, select: { id: true } }))
  );

  const criada = await db.category.create({
    data: {
      slug,
      name: v.name,
      description: v.description || null,
      longDescription: v.longDescription || null,
      position: v.position,
      active: v.active,
    },
    select: { id: true },
  });

  revalidarCatalogo();
  redirect(`/admin/categorias/${criada.id}`);
}

export async function salvarCategoria(
  id: string,
  _anterior: unknown,
  dados: FormData
) {
  await exigirSessao();
  const lido = ler(dados);
  if (!lido.success) {
    return { erro: lido.error.issues[0]?.message ?? "Confira os campos." };
  }
  const v = lido.data;

  await db.category.update({
    where: { id },
    data: {
      name: v.name,
      description: v.description || null,
      longDescription: v.longDescription || null,
      position: v.position,
      active: v.active,
      capaProdutoId: v.capaProdutoId || null,
    },
  });

  revalidarCatalogo();
  return { ok: "Categoria salva." };
}

/**
 * Apagar só quando está vazia.
 *
 * Categoria com peça não pode ser apagada: as peças iriam junto, e peça é o
 * trabalho dela — semanas de crochê por trás de cada uma. O caminho para tirar
 * do site uma categoria que tem peça é **desativar**, que some do site e não
 * apaga nada.
 *
 * A verificação é feita aqui e não só na tela porque botão escondido não é
 * regra: a ação é uma URL, e regra que mora só no botão não é regra.
 */
export async function apagarCategoria(id: string) {
  await exigirSessao();

  const categoria = await db.category.findUnique({
    where: { id },
    select: { _count: { select: { products: true, subcategories: true } } },
  });
  if (!categoria) return { erro: "Categoria não encontrada." };

  if (categoria._count.products > 0) {
    return {
      erro:
        `Esta categoria tem ${categoria._count.products} ` +
        `${categoria._count.products === 1 ? "peça" : "peças"} dentro. ` +
        "Mova as peças para outra categoria antes de apagar, ou desative — " +
        "desativar tira do site sem apagar nada.",
    };
  }
  if (categoria._count.subcategories > 0) {
    return { erro: "Esta categoria tem tipos cadastrados. Apague os tipos antes." };
  }

  await db.category.delete({ where: { id } });
  revalidarCatalogo();
  redirect("/admin/categorias");
}

/** Atalho da lista: liga e desliga sem abrir a categoria. */
export async function alternarCategoria(id: string, ativa: boolean) {
  await exigirSessao();
  await db.category.update({ where: { id }, data: { active: ativa } });
  revalidarCatalogo();
}
