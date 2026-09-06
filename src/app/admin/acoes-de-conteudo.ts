"use server";

import { z } from "zod";
import { del, put } from "@vercel/blob";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { revalidarCatalogo } from "@/lib/revalidar";

export type Resultado = { erro?: string; ok?: string };

/**
 * Campo de texto opcional, com as quebras de linha normalizadas.
 *
 * O `\r\n` não é capricho: a especificação de formulário HTML manda **normalizar
 * a quebra de `textarea` para CRLF** no envio. Quem lê o texto depois e separa
 * parágrafos por `\n{2,}` não encontra nada — o `\r` fica no meio dos dois `\n`.
 * Foi assim que o "quem faz" da home virou um bloco só.
 */
const opcional = z
  .string()
  .trim()
  .transform((v) => v.replace(/\r\n?/g, "\n"))
  .transform((v) => (v === "" ? null : v));

// ------------------------------------------------------------ configurações

const esquemaDeConfiguracoes = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 12 && v.length <= 13, {
      message: "O número precisa ter país e DDD: 5524999999999.",
    }),
  whatsappTemplate: z
    .string()
    .trim()
    .min(10, "Escreva o modelo da mensagem.")
    .refine((v) => v.includes("{produto}") && v.includes("{link}"), {
      message:
        "O modelo precisa conter pelo menos {produto} e {link} — sem eles você recebe as escolhas sem saber de qual peça são.",
    }),
  instagramUrl: opcional,
  email: opcional,
  city: z.string().trim().min(2, "Informe a cidade."),
  heroTitle: opcional,
  heroSubtitle: opcional,
  aboutImageAlt: opcional,
  announcementText: opcional,
  announcementActive: z.coerce.boolean(),
});

export async function salvarConfiguracoes(
  _anterior: unknown,
  dados: FormData
): Promise<Resultado> {
  await exigirSessao();
  const analise = esquemaDeConfiguracoes.safeParse({
    ...Object.fromEntries(dados.entries()),
    announcementActive: dados.get("announcementActive") === "on",
  });
  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  await db.siteSettings.update({ where: { id: "singleton" }, data: analise.data });
  revalidarCatalogo();
  return { ok: "Configurações salvas." };
}

/**
 * Foto da seção "quem faz".
 *
 * Sobe na hora de escolher, e não ao salvar o formulário — mesma regra das
 * fotos de peça: a Raquel escolhe a foto e vê a foto. A anterior é apagada do
 * Blob, porque é uma só e a antiga não serve para mais nada.
 */
const TIPOS_DE_IMAGEM = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const TAMANHO_MAXIMO = 15 * 1024 * 1024;

export async function enviarFotoDoQuemFaz(
  _anterior: unknown,
  dados: FormData
): Promise<Resultado> {
  await exigirSessao();

  const arquivo = dados.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Escolha uma foto." };
  }
  if (!TIPOS_DE_IMAGEM.includes(arquivo.type)) {
    return { erro: "Use uma foto em JPG, PNG, WebP ou AVIF." };
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return { erro: "A foto passa de 15 MB. Reduza antes de enviar." };
  }

  const atual = await db.siteSettings.findUniqueOrThrow({
    where: { id: "singleton" },
    select: { aboutImageUrl: true },
  });

  const enviado = await put(`site/quem-faz/${arquivo.name}`, arquivo, {
    access: "public",
    addRandomSuffix: true,
  });

  await db.siteSettings.update({
    where: { id: "singleton" },
    data: { aboutImageUrl: enviado.url },
  });

  // Depois de trocar, não antes: se o envio falhasse, a foto antiga já teria
  // sido apagada e a home ficaria sem nada.
  if (atual.aboutImageUrl) await Promise.allSettled([del(atual.aboutImageUrl)]);

  revalidarCatalogo();
  return { ok: "Foto atualizada." };
}

export async function apagarFotoDoQuemFaz(): Promise<void> {
  await exigirSessao();
  const atual = await db.siteSettings.findUniqueOrThrow({
    where: { id: "singleton" },
    select: { aboutImageUrl: true },
  });
  if (!atual.aboutImageUrl) return;

  await db.siteSettings.update({
    where: { id: "singleton" },
    data: { aboutImageUrl: null },
  });
  await Promise.allSettled([del(atual.aboutImageUrl)]);
  revalidarCatalogo();
}

// --------------------------------------------------------------- categorias

/**
 * Reordena as categorias a partir da lista inteira, na ordem em que ela ficou.
 *
 * Recebe todos os ids, e não "mova este para lá": arrastar produz uma ordem
 * nova por completo, e reconstruir isso a partir de movimentos individuais
 * abriria espaço para o servidor e a tela discordarem no meio do caminho.
 */
export async function reordenarCategorias(ids: string[]): Promise<void> {
  await exigirSessao();
  if (ids.length === 0) return;
  await db.$transaction(
    ids.map((id, i) => db.category.update({ where: { id }, data: { position: i } }))
  );
  revalidarCatalogo();
}

/** Desligar tira a categoria do site sem apagar peça nenhuma. */
export async function alternarCategoria(id: string, ativa: boolean): Promise<void> {
  await exigirSessao();
  await db.category.update({ where: { id }, data: { active: ativa } });
  revalidarCatalogo();
}

/**
 * Apagar só vale para categoria vazia.
 *
 * Com peça dentro, apagar levaria as peças junto — e a mensagem manda desativar,
 * que é o que ela quer em praticamente todos os casos.
 */
export async function apagarCategoria(id: string): Promise<Resultado> {
  await exigirSessao();

  const categoria = await db.category.findUnique({
    where: { id },
    select: {
      name: true,
      _count: { select: { products: true, subcategories: true } },
    },
  });
  if (!categoria) return { erro: "Categoria não encontrada." };

  if (categoria._count.products > 0) {
    return {
      erro: `"${categoria.name}" tem ${categoria._count.products} ${
        categoria._count.products === 1 ? "peça" : "peças"
      }. Apagar levaria as peças junto — desative em vez de apagar.`,
    };
  }
  if (categoria._count.subcategories > 0) {
    return {
      erro: `"${categoria.name}" tem subcategorias. Apague as subcategorias antes.`,
    };
  }

  await db.category.delete({ where: { id } });
  revalidarCatalogo();
  return { ok: "Categoria apagada." };
}

export async function salvarCategoria(
  _anterior: unknown,
  dados: FormData
): Promise<Resultado> {
  await exigirSessao();
  const id = String(dados.get("id") ?? "");
  const nome = String(dados.get("name") ?? "").trim();
  if (!id || nome.length < 2) return { erro: "Dê um nome à categoria." };

  // A ordem NÃO entra aqui. Ela é mudada arrastando ou pelas setas, e o
  // formulário não tem mais o campo — ler `position` de um FormData que não o
  // traz devolveria 0 e jogaria a categoria para o topo a cada gravação.
  await db.category.update({
    where: { id },
    data: {
      name: nome,
      description: String(dados.get("description") ?? "").trim() || null,
      longDescription: String(dados.get("longDescription") ?? "").trim() || null,
    },
  });
  revalidarCatalogo();
  return { ok: "Categoria salva." };
}

// -------------------------------------------------------------------- páginas


// ------------------------------------------------------------------ perguntas



// ---------------------------------------------------------------- depoimentos


