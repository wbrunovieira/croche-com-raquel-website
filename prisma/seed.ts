import { config as carregarEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";
import { PAGINAS, PERGUNTAS } from "./conteudo";
import { DEMONSTRACOES_ANTIGAS, PRODUTOS } from "./catalogo";

carregarEnv({ path: ".env.local", quiet: true });

/**
 * Texto da faixa "quem faz".
 *
 * Em parágrafos separados por linha em branco: a seção da home usa o primeiro
 * como título e os demais como corpo. Três é o que cabe ao lado da foto sem a
 * coluna ficar mais alta que ela.
 */
const SOBRE_A_RAQUEL = `Sou a Raquel. Faço crochê e macramê em Petrópolis, na serra do Rio, e cada peça que sai daqui foi feita à mão, uma de cada vez.

Não trabalho com estoque. Você escolhe o tipo, a cor e o acabamento, e a peça só começa a ser feita depois disso — é por isso que ela sai do jeito que você quis, e é por isso que tem prazo.

Se o que você tem em mente não está no site, me conte assim mesmo. Boa parte do que eu faço hoje nasceu de um pedido que ainda não existia.`;

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

// Seed idempotente: roda quantas vezes for preciso sem duplicar nada.
// Os produtos são as peças reais da Raquel, lidas das fotos do Instagram. As
// fotos em si sobem ao Blob por `pnpm fotos:importar`, que roda depois deste.

const TEXTO_LONGO_BOLSAS = `## Bolsa de crochê feita à mão, sob encomenda

Cada bolsa que sai daqui é feita uma de cada vez, em fio de malha de algodão. Não existe estoque: você escolhe o tipo, a cor, o tamanho e o acabamento, e a peça começa a ser feita depois disso. É por isso que ela sai do jeito que você quer — e é por isso que tem prazo.

## Que tipo de bolsa escolher

A **transversal** é a do dia a dia: alça ajustável, corpo estruturado, cabe o essencial e libera as mãos. A **tote** é a de carregar tudo, com boca larga e alça reforçada. A **clutch** é a de festa. A de **praia** é larga e leve, feita em ponto vazado para a areia sair. A **necessaire** é a peça de entrada, boa para presentear.

## Fio de malha, e por que ele importa

O fio de malha é grosso, macio e firme. Ele segura o formato da bolsa mesmo cheia, não desfia com o uso e aceita cor viva sem desbotar rápido. Toda cor do site tem código de fio registrado, então uma peça encomendada hoje pode ser refeita igual daqui a um ano.

## Personalização

Além de cor e tamanho, boa parte das bolsas aceita escolha de alça (de mão, transversal ajustável, corrente ou couro), forro e tipo de fecho. Algumas aceitam nome ou monograma bordado. O que aparece na página de cada peça é o que aquela peça aceita.

## Prazo e envio

O prazo de produção fica escrito na página de cada bolsa — em geral de 7 a 15 dias, dependendo do tamanho e do acabamento. Depois de pronta, envio para todo o Brasil pelos Correios, ou entrega combinada em Petrópolis.`;

const CATEGORIAS: {
  slug: string;
  name: string;
  position: number;
  description: string;
  longDescription?: string;
}[] = [
  {
    slug: "bolsas",
    name: "Bolsas",
    position: 0,
    description:
      "O carro-chefe. Feitas à mão em fio de malha, na cor e no tamanho que você escolher.",
    longDescription: TEXTO_LONGO_BOLSAS,
  },
  { slug: "mesa-posta", name: "Mesa Posta", position: 1, description: "Jogo americano, porta-copos e trilhos para deixar a mesa com cara de casa." },
  { slug: "casa-decoracao", name: "Casa & Decoração", position: 2, description: "Mantas, almofadas e cestos que dão o toque único no seu lar." },
  { slug: "macrame", name: "Macramê", position: 3, description: "Suportes de planta e painéis de parede em nós feitos um a um." },
  { slug: "cozinha", name: "Cozinha", position: 4, description: "Pegadores, puxa-saco e capas que resolvem e enfeitam." },
  { slug: "bebe-enxoval", name: "Bebê & Enxoval", position: 5, description: "Mantinhas e peças de enxoval para receber quem está chegando." },
];

const SUBCATEGORIAS_BOLSA = [
  { slug: "transversal", name: "Transversal", position: 0 },
  { slug: "tote", name: "Ombro / Tote", position: 1 },
  { slug: "clutch", name: "Clutch / Festa", position: 2 },
  { slug: "praia", name: "Praia", position: 3 },
  { slug: "mochila", name: "Mochila", position: 4 },
  { slug: "ecobag", name: "Sacola / Ecobag", position: 5 },
  { slug: "necessaire", name: "Necessaire", position: 6 },
];

type ValorOpcao = {
  slug: string;
  name: string;
  hex?: string;
  /// Linha e código do fio. ATENÇÃO: os valores abaixo são ILUSTRATIVOS —
  /// servem para a gente ver a tela de pé. A Raquel substitui pelos fios que
  /// ela realmente compra, olhando a etiqueta.
  yarnLine?: string;
  yarnColorCode?: string;
};
type GrupoOpcao = {
  slug: string;
  name: string;
  type: "SINGLE" | "MULTIPLE" | "TEXT";
  position: number;
  values: ValorOpcao[];
};

const GRUPOS: GrupoOpcao[] = [
  {
    slug: "cor", name: "Cor", type: "SINGLE", position: 0,
    values: [
      { slug: "cru", name: "Cru", hex: "#E8DCC8", yarnLine: "Barroco Maxcolor 400g", yarnColorCode: "0020" },
      { slug: "off-white", name: "Off-white", hex: "#F2EDE4", yarnLine: "Barroco Maxcolor 400g", yarnColorCode: "8001" },
      { slug: "caramelo", name: "Caramelo", hex: "#B07A4A", yarnLine: "Barroco Maxcolor 400g", yarnColorCode: "7625" },
      { slug: "terracota", name: "Terracota", hex: "#B05A3C", yarnLine: "Barroco Maxcolor 400g", yarnColorCode: "7684" },
      { slug: "verde-musgo", name: "Verde Musgo", hex: "#5A6B4A", yarnLine: "Barroco Maxcolor 400g", yarnColorCode: "5364" },
      { slug: "rosa-antigo", name: "Rosa Antigo", hex: "#C992A0", yarnLine: "Barroco Maxcolor 400g", yarnColorCode: "3526" },
      { slug: "mostarda", name: "Mostarda", hex: "#C9A227", yarnLine: "Barroco Maxcolor 400g", yarnColorCode: "7334" },
      { slug: "azul-jeans", name: "Azul Jeans", hex: "#54708C", yarnLine: "Barroco Maxcolor 400g", yarnColorCode: "2012" },
      { slug: "preto", name: "Preto", hex: "#2B2B2B", yarnLine: "Barroco Maxcolor 400g", yarnColorCode: "8990" },
      // Tiradas das fotos das peças reais. Sem linha nem código de fio: são
      // dela, e chutar o código faria a Raquel recomprar o fio errado.
      { slug: "vinho", name: "Vinho", hex: "#6E2233" },
      { slug: "cafe", name: "Café", hex: "#4A3730" },
    ],
  },
  {
    slug: "tamanho", name: "Tamanho", type: "SINGLE", position: 1,
    values: [
      { slug: "p", name: "P" },
      { slug: "m", name: "M" },
      { slug: "g", name: "G" },
    ],
  },
  {
    slug: "alca", name: "Alça", type: "SINGLE", position: 2,
    values: [
      { slug: "de-mao", name: "De mão" },
      { slug: "transversal-ajustavel", name: "Transversal ajustável" },
      { slug: "corrente", name: "Corrente" },
      { slug: "de-couro", name: "De couro" },
    ],
  },
  {
    slug: "forro", name: "Forro", type: "SINGLE", position: 3,
    values: [
      { slug: "com-forro", name: "Com forro" },
      { slug: "sem-forro", name: "Sem forro" },
    ],
  },
  {
    slug: "fecho", name: "Fecho", type: "SINGLE", position: 4,
    values: [
      { slug: "ziper", name: "Zíper" },
      { slug: "botao-magnetico", name: "Botão magnético" },
      { slug: "cordao", name: "Cordão" },
      { slug: "sem-fecho", name: "Sem fecho" },
    ],
  },
  {
    slug: "personalizacao", name: "Personalização", type: "TEXT", position: 5,
    values: [],
  },
];

const COLECOES = [
  { slug: "natal", name: "Natal", position: 0, active: false, description: "Peças de fim de ano. Encomendas até 30/11." },
  { slug: "dia-das-maes", name: "Dia das Mães", position: 1, active: false, description: "Presentes feitos à mão." },
];


async function main() {
  await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      whatsappNumber: "5524992087591",
      whatsappTemplate:
        "Oi Raquel! Vi no site e me interessei 💛\n\n*{produto}* ({codigo})\n{opcoes}\nQuantidade: {quantidade}\n\n{link}",
      instagramUrl: "https://www.instagram.com/croche.comraquel/",
      city: "Petrópolis, RJ",
      heroTitle: "Bolsas que você carrega por anos",
      heroSubtitle:
        "Peças de crochê feitas à mão, sob encomenda, na cor e no tamanho que você escolher.",
      aboutText: SOBRE_A_RAQUEL,
      announcementText: null,
      announcementActive: false,
    },
  });

  for (const c of CATEGORIAS) {
    const dados = { ...c, longDescription: c.longDescription ?? null };
    await db.category.upsert({ where: { slug: c.slug }, update: dados, create: dados });
  }

  const bolsas = await db.category.findUniqueOrThrow({ where: { slug: "bolsas" } });
  for (const s of SUBCATEGORIAS_BOLSA) {
    await db.subcategory.upsert({
      where: { categoryId_slug: { categoryId: bolsas.id, slug: s.slug } },
      update: { name: s.name, position: s.position },
      create: { ...s, categoryId: bolsas.id },
    });
  }

  for (const c of COLECOES) {
    await db.collection.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  for (const g of GRUPOS) {
    const grupo = await db.optionGroup.upsert({
      where: { slug: g.slug },
      update: { name: g.name, type: g.type, position: g.position },
      create: { slug: g.slug, name: g.name, type: g.type, position: g.position },
    });
    for (const [i, v] of g.values.entries()) {
      await db.optionValue.upsert({
        where: { groupId_slug: { groupId: grupo.id, slug: v.slug } },
        update: {
          name: v.name,
          hex: v.hex ?? null,
          yarnLine: v.yarnLine ?? null,
          yarnColorCode: v.yarnColorCode ?? null,
          position: i,
        },
        create: {
          groupId: grupo.id,
          slug: v.slug,
          name: v.name,
          hex: v.hex ?? null,
          yarnLine: v.yarnLine ?? null,
          yarnColorCode: v.yarnColorCode ?? null,
          position: i,
        },
      });
    }
  }

  for (const [i, p] of PRODUTOS.entries()) {
    const categoria = await db.category.findUniqueOrThrow({ where: { slug: p.categoria } });
    const subcategoria = p.subcategoria
      ? await db.subcategory.findUniqueOrThrow({
          where: { categoryId_slug: { categoryId: categoria.id, slug: p.subcategoria } },
        })
      : null;

    const dados = {
      name: p.name,
      description: p.description,
      price: p.price,
      dimensions: p.dimensions ?? null,
      material: p.material ?? null,
      capacity: p.capacity ?? null,
      careText: p.careText ?? null,
      productionDaysMin: p.diasMin ?? null,
      productionDaysMax: p.diasMax ?? null,
      status: "PUBLISHED" as const,
      featured: p.destaque !== undefined,
      featuredPosition: p.destaque ?? null,
      position: i,
      categoryId: categoria.id,
      subcategoryId: subcategoria?.id ?? null,
    };

    const produto = await db.product.upsert({
      where: { slug: p.slug },
      update: dados,
      create: { slug: p.slug, ...dados },
    });

    for (const [j, o] of p.opcoes.entries()) {
      const grupo = await db.optionGroup.findUniqueOrThrow({ where: { slug: o.grupo } });
      const pog = await db.productOptionGroup.upsert({
        where: { productId_groupId: { productId: produto.id, groupId: grupo.id } },
        update: { required: o.obrigatorio, position: j },
        create: { productId: produto.id, groupId: grupo.id, required: o.obrigatorio, position: j },
      });
      for (const [k, slugValor] of o.valores.entries()) {
        const valor = await db.optionValue.findUniqueOrThrow({
          where: { groupId_slug: { groupId: grupo.id, slug: slugValor } },
        });
        await db.productOptionValue.upsert({
          where: {
            productOptionGroupId_optionValueId: {
              productOptionGroupId: pog.id,
              optionValueId: valor.id,
            },
          },
          update: { position: k },
          create: { productOptionGroupId: pog.id, optionValueId: valor.id, position: k },
        });
      }
    }
  }

  // As peças de exemplo saem depois de os produtos reais entrarem, para o site
  // nunca ficar sem catálogo entre um passo e outro.
  const removidas = await db.product.deleteMany({
    where: { slug: { in: DEMONSTRACOES_ANTIGAS } },
  });
  if (removidas.count > 0) {
    console.log(`Removidas ${removidas.count} peças de demonstração.`);
  }

  for (const pagina of PAGINAS) {
    const dados = {
      title: pagina.title,
      lead: pagina.lead,
      content: pagina.content,
      seoDescription: pagina.seoDescription,
      published: true,
    };
    await db.page.upsert({
      where: { slug: pagina.slug },
      update: dados,
      create: { slug: pagina.slug, ...dados },
    });
  }

  // As perguntas não têm slug natural, então a pergunta em si é a chave: assim
  // reordenar ou reescrever a resposta não cria duplicata.
  for (const [i, p] of PERGUNTAS.entries()) {
    const existente = await db.faqItem.findFirst({ where: { question: p.question } });
    const dados = { answer: p.answer, topic: p.topic, position: i, published: true };
    if (existente) {
      await db.faqItem.update({ where: { id: existente.id }, data: dados });
    } else {
      await db.faqItem.create({ data: { question: p.question, ...dados } });
    }
  }

  const [cat, sub, prod, grp, val] = await Promise.all([
    db.category.count(), db.subcategory.count(), db.product.count(),
    db.optionGroup.count(), db.optionValue.count(),
  ]);
  const [pag, faq] = await Promise.all([db.page.count(), db.faqItem.count()]);
  console.log(
    `Seed: ${cat} categorias, ${sub} subcategorias de bolsa, ${prod} produtos, ` +
    `${grp} grupos de opção com ${val} valores, ${pag} páginas e ${faq} perguntas.`
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
