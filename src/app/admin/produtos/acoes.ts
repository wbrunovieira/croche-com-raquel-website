"use server";

import { del, put } from "@vercel/blob";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { slugUnico } from "@/lib/admin/slug";
import { revalidarCatalogo, revalidarProduto } from "@/lib/revalidar";

/** Campo de número que aceita vazio — "" vira null, não 0. */


const esquemaDeProduto = z.object({
  name: z.string().trim().min(2, "O nome precisa de pelo menos 2 letras."),
  description: z.string().trim().min(10, "Escreva uma descrição."),
  // Preço vazio significa "sob consulta". Nunca vira 0.
  price: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v.replace(",", "."))))
    .refine((n) => n === null || (Number.isFinite(n) && n >= 0), {
      message: "Preço inválido. Deixe em branco para “sob consulta”.",
    }),
  categoryId: z.string().min(1, "Escolha a categoria."),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  featured: z.coerce.boolean(),
});

/**
 * O cadastro guarda o essencial de uma VITRINE, e só.
 *
 * Medidas, material, o que cabe dentro, cuidados, prazo e as ordens saíram do
 * formulário: este é o primeiro site dela, ninguém compra por aqui, e cada
 * detalhe desses ela esclarece na conversa do WhatsApp. Um formulário com
 * dezoito campos para preencher é um formulário que ela não usa.
 *
 * **As colunas continuam no banco de propósito.** As peças já cadastradas
 * guardam o que têm, a página da peça mostra cada bloco só quando ele existe, e
 * o dia que fizer sentido pedir isso de volta o dado não precisa ser
 * reconstruído. O que não pode acontecer é o schema listar campo que o
 * formulário não manda mais: `position` tinha `.catch(0)`, e salvar uma peça
 * mandaria a ordem dela para zero em silêncio — foi exatamente esse defeito que
 * apareceu nas categorias.
 */

export type ResultadoDaAcao = { erro?: string; ok?: string };

/**
 * Cria a peça inteira numa tela só.
 *
 * Antes eram duas: uma pedia nome, categoria e fotos, e a outra — depois de
 * criar — pedia descrição, preço e situação. Isso fazia sentido quando o
 * cadastro tinha dezoito campos e criar primeiro era uma forma de não assustar.
 * Com sete campos virou burocracia: dois formulários, duas confirmações e a
 * sensação de que a peça ficou pela metade. O Bruno cortou, e está certo.
 *
 * A ordem interna continua sendo criar-depois-subir, porque a foto vai para
 * `produtos/<slug>/` no Blob e o caminho precisa do slug. Do ponto de vista
 * dela é um botão só.
 */
export async function criarProduto(_anterior: unknown, dados: FormData) {
  await exigirSessao();

  const nome = String(dados.get("name") ?? "").trim();
  const categoryId = String(dados.get("categoryId") ?? "");
  const descricao = String(dados.get("description") ?? "").trim();
  const precoBruto = String(dados.get("price") ?? "").trim();
  const destaque = dados.get("featured") === "on";
  const noAr = dados.get("status") === "PUBLISHED";

  if (nome.length < 2) return { erro: "Dê um nome para a peça." };
  if (!categoryId) return { erro: "Escolha a categoria." };

  // Preço vazio significa "sob consulta". Nunca vira 0.
  const preco = precoBruto === "" ? null : Number(precoBruto.replace(",", "."));
  if (preco !== null && (!Number.isFinite(preco) || preco < 0)) {
    return { erro: "Preço inválido. Deixe em branco para “sob consulta”." };
  }

  // As fotos são conferidas ANTES de a peça existir. Se a validação
  // acontecesse durante o envio, uma foto ruim no meio da fila deixaria a peça
  // criada pela metade — e ela teria de descobrir isso na tela seguinte.
  const fotos = dados
    .getAll("fotos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  for (const foto of fotos) {
    const problema = problemaNaFoto(foto);
    if (problema) return { erro: problema };
  }

  // As duas condições para ir ao ar são conferidas aqui, e não depois de criar:
  // a peça publicada é a que a cliente vê, e página sem foto ou sem texto é
  // pior que peça que ainda não estreou.
  if (noAr && fotos.length === 0) {
    return { erro: "Para a peça já entrar no ar, escolha pelo menos uma foto." };
  }
  if (noAr && descricao.length < 10) {
    return { erro: "Para a peça já entrar no ar, escreva a descrição." };
  }

  const slug = await slugUnico(nome, async (candidato) =>
    Boolean(
      await db.product.findUnique({ where: { slug: candidato }, select: { id: true } })
    )
  );

  let posicaoDeDestaque: number | null = null;
  if (destaque) {
    const agregado = await db.product.aggregate({
      where: { featured: true },
      _max: { featuredPosition: true },
    });
    posicaoDeDestaque = (agregado._max.featuredPosition ?? -1) + 1;
  }

  const produto = await db.product.create({
    data: {
      slug,
      name: nome,
      description: descricao,
      price: preco,
      categoryId,
      featured: destaque,
      featuredPosition: posicaoDeDestaque,
      status: noAr ? "PUBLISHED" : "DRAFT",
    },
  });

  for (const [i, foto] of fotos.entries()) {
    await guardarFoto(produto, foto, i);
  }

  // Se já nasceu no ar, o site precisa saber na hora.
  if (noAr) revalidarCatalogo();

  // Volta para a lista, e não para a edição: ir para um segundo formulário é
  // justamente o que fazia a criação parecer inacabada.
  redirect("/admin/produtos");
}

export async function salvarProduto(
  _anterior: unknown,
  dados: FormData
): Promise<ResultadoDaAcao> {
  await exigirSessao();
  const id = String(dados.get("id") ?? "");
  if (!id) return { erro: "Peça não encontrada." };

  // Lido campo a campo, e não com Object.fromEntries: um campo que só existe
  // na tela sob condição — featuredPosition aparece apenas com "destaque"
  // marcado — simplesmente não vem no FormData, e o esquema receberia
  // `undefined` onde espera texto.
  const texto = (chave: string) => String(dados.get(chave) ?? "");
  const analise = esquemaDeProduto.safeParse({
    name: texto("name"),
    description: texto("description"),
    price: texto("price"),
    categoryId: texto("categoryId"),
    status: texto("status"),
    featured: dados.get("featured") === "on",
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }
  const v = analise.data;

  if (v.status === "PUBLISHED") {
    const fotos = await db.productImage.count({ where: { productId: id } });
    if (fotos === 0) {
      return {
        erro: "Esta peça não tem foto. Adicione pelo menos uma antes de colocar no ar.",
      };
    }
  }

  // Quantos destaques já existem, para a peça nova entrar no fim da fila.
  let posicaoDeDestaque: number | null = null;
  if (v.featured) {
    const atual = await db.product.findUnique({
      where: { id },
      select: { featuredPosition: true },
    });
    if (atual?.featuredPosition === null) {
      const agregado = await db.product.aggregate({
        where: { featured: true },
        _max: { featuredPosition: true },
      });
      posicaoDeDestaque = (agregado._max.featuredPosition ?? -1) + 1;
    }
  }

  const produto = await db.product.update({
    where: { id },
    data: {
      ...v,
      // Sem campo de ordem no formulário, quem decide a posição é o código:
      // peça marcada que ainda não tinha lugar entra no fim da fila da home;
      // desmarcada, sai. Ela nunca precisa pensar em número.
      //
      // Não dá para deixar `undefined` e esperar o melhor: a home ordena por
      // `featuredPosition asc`, e no Postgres nulo vem por ÚLTIMO nessa
      // ordenação — a peça recém-marcada iria para o fim e ficaria fora das
      // oito que a home mostra.
      featuredPosition: v.featured ? (posicaoDeDestaque ?? undefined) : null,
    },
    select: { slug: true },
  });

  revalidarProduto(produto.slug);
  return { ok: "Peça salva." };
}

export async function apagarProduto(id: string) {
  await exigirSessao();

  const produto = await db.product.findUnique({
    where: { id },
    select: { slug: true, images: { select: { url: true } } },
  });
  if (!produto) return;

  // As fotos saem do armazenamento junto: sem isto elas ficariam pagando
  // espaço para sempre, sem nada apontando para elas.
  await Promise.allSettled(produto.images.map((i) => del(i.url)));
  await db.product.delete({ where: { id } });

  revalidarProduto(produto.slug);
  redirect("/admin/produtos");
}

const TIPOS_DE_IMAGEM = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const TAMANHO_MAXIMO = 15 * 1024 * 1024;

/**
 * Valida um arquivo de foto. Devolve a mensagem do problema, ou null.
 *
 * Separado para a criação poder conferir **todas** as fotos antes de criar a
 * peça: se a validação acontecesse durante o envio, uma foto ruim no meio da
 * fila deixaria a peça criada pela metade.
 */
function problemaNaFoto(arquivo: unknown): string | null {
  if (!(arquivo instanceof File) || arquivo.size === 0) return "Escolha uma foto.";
  if (!TIPOS_DE_IMAGEM.includes(arquivo.type)) {
    return `"${arquivo.name}" não é JPG, PNG, WebP ou AVIF.`;
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return `"${arquivo.name}" passa de 15 MB. Reduza antes de enviar.`;
  }
  return null;
}

/** Sobe a foto ao Blob e liga à peça. Usado na criação e na edição. */
async function guardarFoto(
  produto: { id: string; slug: string },
  arquivo: File,
  posicao: number,
  extras: { alt?: string; escalaHumana?: boolean } = {}
) {
  const enviado = await put(`produtos/${produto.slug}/${arquivo.name}`, arquivo, {
    access: "public",
    // Nome com sufixo aleatório: duas fotos com o mesmo nome não se
    // sobrescrevem, e o cache do navegador não entrega a antiga.
    addRandomSuffix: true,
  });

  await db.productImage.create({
    data: {
      productId: produto.id,
      url: enviado.url,
      alt: extras.alt?.trim() || produto.slug.replace(/-/g, " "),
      position: posicao,
      hasHumanScale: extras.escalaHumana ?? false,
    },
  });
}

export async function enviarImagem(
  _anterior: unknown,
  dados: FormData
): Promise<ResultadoDaAcao> {
  await exigirSessao();

  const productId = String(dados.get("productId") ?? "");
  const arquivo = dados.get("arquivo");

  if (!productId) return { erro: "Peça não encontrada." };
  const problema = problemaNaFoto(arquivo);
  if (problema) return { erro: problema };

  const produto = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, _count: { select: { images: true } } },
  });
  if (!produto) return { erro: "Peça não encontrada." };

  await guardarFoto(produto, arquivo as File, produto._count.images, {
    alt: String(dados.get("alt") ?? ""),
    escalaHumana: dados.get("escalaHumana") === "on",
  });

  revalidarProduto(produto.slug);
  return { ok: "Foto adicionada." };
}

export async function apagarImagem(imageId: string) {
  await exigirSessao();
  const imagem = await db.productImage.findUnique({
    where: { id: imageId },
    select: { url: true, product: { select: { slug: true } } },
  });
  if (!imagem) return;

  await Promise.allSettled([del(imagem.url)]);
  await db.productImage.delete({ where: { id: imageId } });
  revalidarProduto(imagem.product.slug);
}

export async function moverImagem(imageId: string, direcao: -1 | 1) {
  await exigirSessao();
  const atual = await db.productImage.findUnique({ where: { id: imageId } });
  if (!atual) return;

  const vizinha = await db.productImage.findFirst({
    where: {
      productId: atual.productId,
      position: direcao === -1 ? { lt: atual.position } : { gt: atual.position },
    },
    orderBy: { position: direcao === -1 ? "desc" : "asc" },
  });
  if (!vizinha) return;

  await db.$transaction([
    db.productImage.update({ where: { id: atual.id }, data: { position: vizinha.position } }),
    db.productImage.update({ where: { id: vizinha.id }, data: { position: atual.position } }),
  ]);

  const produto = await db.product.findUnique({
    where: { id: atual.productId },
    select: { slug: true },
  });
  if (produto) revalidarProduto(produto.slug);
}

export async function alternarEscalaHumana(imageId: string, valor: boolean) {
  await exigirSessao();
  const imagem = await db.productImage.update({
    where: { id: imageId },
    data: { hasHumanScale: valor },
    select: { product: { select: { slug: true } } },
  });
  revalidarProduto(imagem.product.slug);
}

export async function duplicarProduto(id: string) {
  await exigirSessao();
  const original = await db.product.findUnique({ where: { id } });
  if (!original) return;

  const slug = await slugUnico(`${original.name} copia`, async (candidato) =>
    Boolean(
      await db.product.findUnique({ where: { slug: candidato }, select: { id: true } })
    )
  );

  const copia = await db.product.create({
    data: {
      slug,
      name: `${original.name} (cópia)`,
      description: original.description,
      price: original.price,
      dimensions: original.dimensions,
      material: original.material,
      capacity: original.capacity,
      careText: original.careText,
      productionDaysMin: original.productionDaysMin,
      productionDaysMax: original.productionDaysMax,
      categoryId: original.categoryId,
      subcategoryId: original.subcategoryId,
      // A cópia nasce fora do ar e sem destaque: duplicar é ponto de partida,
      // não publicação.
      status: "DRAFT",
      featured: false,
    },
  });

  revalidarCatalogo();
  redirect(`/admin/produtos/${copia.id}`);
}
