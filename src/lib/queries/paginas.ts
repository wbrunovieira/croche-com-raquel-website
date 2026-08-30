import { db } from "@/lib/db";

export type PaginaInstitucional = {
  slug: string;
  titulo: string;
  chamada: string | null;
  corpo: string;
  descricaoSeo: string | null;
};

export type Pergunta = {
  id: string;
  pergunta: string;
  resposta: string;
  topico: string | null;
};

export async function buscarPagina(slug: string): Promise<PaginaInstitucional | null> {
  const p = await db.page.findFirst({ where: { slug, published: true } });
  if (!p) return null;
  return {
    slug: p.slug,
    titulo: p.title,
    chamada: p.lead,
    corpo: p.content,
    descricaoSeo: p.seoDescription,
  };
}

export async function listarSlugsDePagina(): Promise<string[]> {
  const linhas = await db.page.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return linhas.map((l) => l.slug);
}

/** Perguntas agrupadas por tópico, preservando a ordem definida no admin. */
export async function listarPerguntas(): Promise<
  { topico: string; perguntas: Pergunta[] }[]
> {
  const linhas = await db.faqItem.findMany({
    where: { published: true },
    orderBy: { position: "asc" },
  });

  const grupos = new Map<string, Pergunta[]>();
  for (const l of linhas) {
    const topico = l.topic ?? "Geral";
    const lista = grupos.get(topico) ?? [];
    lista.push({
      id: l.id,
      pergunta: l.question,
      resposta: l.answer,
      topico: l.topic,
    });
    grupos.set(topico, lista);
  }

  return [...grupos.entries()].map(([topico, perguntas]) => ({ topico, perguntas }));
}

/** Lista plana — usada pelo schema.org FAQPage. */
export async function listarPerguntasPlanas(): Promise<Pergunta[]> {
  const grupos = await listarPerguntas();
  return grupos.flatMap((g) => g.perguntas);
}
