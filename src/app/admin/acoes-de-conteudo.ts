"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { revalidarCatalogo } from "@/lib/revalidar";

export type Resultado = { erro?: string; ok?: string };

const opcional = z.string().trim().transform((v) => (v === "" ? null : v));

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
  aboutText: opcional,
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

// --------------------------------------------------------------- categorias

export async function salvarCategoria(
  _anterior: unknown,
  dados: FormData
): Promise<Resultado> {
  await exigirSessao();
  const id = String(dados.get("id") ?? "");
  const nome = String(dados.get("name") ?? "").trim();
  if (!id || nome.length < 2) return { erro: "Dê um nome à categoria." };

  await db.category.update({
    where: { id },
    data: {
      name: nome,
      description: String(dados.get("description") ?? "").trim() || null,
      longDescription: String(dados.get("longDescription") ?? "").trim() || null,
      position: Number(dados.get("position") ?? 0) || 0,
    },
  });
  revalidarCatalogo();
  return { ok: "Categoria salva." };
}

// -------------------------------------------------------------------- páginas

export async function salvarPagina(_anterior: unknown, dados: FormData): Promise<Resultado> {
  await exigirSessao();
  const slug = String(dados.get("slug") ?? "");
  const title = String(dados.get("title") ?? "").trim();
  const content = String(dados.get("content") ?? "").trim();
  if (!slug) return { erro: "Página não encontrada." };
  if (title.length < 2) return { erro: "Dê um título à página." };
  if (content.length < 20) return { erro: "Escreva o conteúdo da página." };

  await db.page.update({
    where: { slug },
    data: {
      title,
      content,
      lead: String(dados.get("lead") ?? "").trim() || null,
      seoDescription: String(dados.get("seoDescription") ?? "").trim() || null,
      published: dados.get("published") === "on",
    },
  });
  revalidarCatalogo();
  return { ok: "Texto salvo." };
}

// ------------------------------------------------------------------ perguntas

export async function salvarPergunta(
  _anterior: unknown,
  dados: FormData
): Promise<Resultado> {
  await exigirSessao();
  const id = String(dados.get("id") ?? "");
  const question = String(dados.get("question") ?? "").trim();
  const answer = String(dados.get("answer") ?? "").trim();
  if (question.length < 5) return { erro: "Escreva a pergunta." };
  if (answer.length < 5) return { erro: "Escreva a resposta." };

  const conteudo = {
    question,
    answer,
    topic: String(dados.get("topic") ?? "").trim() || null,
    position: Number(dados.get("position") ?? 0) || 0,
    published: dados.get("published") === "on",
  };

  if (id) await db.faqItem.update({ where: { id }, data: conteudo });
  else await db.faqItem.create({ data: conteudo });

  revalidarCatalogo();
  return { ok: "Pergunta salva." };
}

export async function apagarPergunta(id: string) {
  await exigirSessao();
  await db.faqItem.delete({ where: { id } });
  revalidarCatalogo();
}

// ---------------------------------------------------------------- depoimentos

export async function salvarDepoimento(
  _anterior: unknown,
  dados: FormData
): Promise<Resultado> {
  await exigirSessao();
  const id = String(dados.get("id") ?? "");
  const authorName = String(dados.get("authorName") ?? "").trim();
  const text = String(dados.get("text") ?? "").trim();
  if (authorName.length < 2) return { erro: "Escreva o nome de quem falou." };
  if (text.length < 10) return { erro: "Escreva o depoimento." };

  const conteudo = {
    authorName,
    text,
    city: String(dados.get("city") ?? "").trim() || null,
    position: Number(dados.get("position") ?? 0) || 0,
    published: dados.get("published") === "on",
  };

  if (id) await db.testimonial.update({ where: { id }, data: conteudo });
  else await db.testimonial.create({ data: conteudo });

  revalidarCatalogo();
  return { ok: "Depoimento salvo." };
}

export async function apagarDepoimento(id: string) {
  await exigirSessao();
  await db.testimonial.delete({ where: { id } });
  revalidarCatalogo();
}
