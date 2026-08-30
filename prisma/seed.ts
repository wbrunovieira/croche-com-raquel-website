import { config as carregarEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlComSslVerificado } from "../src/lib/db-url";

carregarEnv({ path: ".env.local", quiet: true });

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlComSslVerificado(process.env.DATABASE_URL) }),
});

// Seed idempotente: roda quantas vezes for preciso sem duplicar nada.
// Os produtos aqui são exemplos plausíveis para a gente ver as telas de pé —
// o catálogo real entra na etapa 13, com as fotos da Raquel.

const CATEGORIAS = [
  { slug: "bolsas", name: "Bolsas", position: 0, description: "O carro-chefe. Feitas à mão em fio de malha, na cor e no tamanho que você escolher." },
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

type Opcao = { grupo: string; obrigatorio: boolean; valores: string[] };

const PRODUTOS: {
  slug: string; name: string; description: string; price: number | null;
  categoria: string; subcategoria?: string;
  dimensions?: string; material?: string; capacity?: string; careText?: string;
  diasMin?: number; diasMax?: number;
  destaque?: number; opcoes: Opcao[];
}[] = [
  {
    slug: "bolsa-serra", name: "Bolsa Serra", categoria: "bolsas", subcategoria: "transversal",
    description: "Transversal de uso diário, com alça ajustável e corpo estruturado. Feita em ponto fechado, que segura o formato mesmo cheia.",
    price: 320, dimensions: "24 × 18 × 8 cm", material: "Fio de malha de algodão",
    capacity: "Cabe carteira, celular, chaves e um livro de bolso.",
    careText: "Lave à mão em água fria com sabão neutro. Seque à sombra, deitada.",
    diasMin: 7, diasMax: 10, destaque: 0,
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["cru", "caramelo", "terracota", "verde-musgo", "preto"] },
      { grupo: "alca", obrigatorio: true, valores: ["transversal-ajustavel", "de-couro"] },
      { grupo: "forro", obrigatorio: true, valores: ["com-forro", "sem-forro"] },
      { grupo: "fecho", obrigatorio: true, valores: ["ziper", "botao-magnetico"] },
      { grupo: "personalizacao", obrigatorio: false, valores: [] },
    ],
  },
  {
    slug: "bolsa-cristal", name: "Bolsa Cristal", categoria: "bolsas", subcategoria: "tote",
    description: "Tote de ombro com boca larga, para quem carrega o dia inteiro junto. Alça reforçada em duas camadas.",
    price: null, dimensions: "38 × 32 × 12 cm", material: "Fio de malha de algodão",
    capacity: "Cabe notebook de 14\", garrafa d'água, carteira e caderno.",
    careText: "Lave à mão em água fria. Não torça — pressione para tirar o excesso de água.",
    diasMin: 10, diasMax: 15, destaque: 1,
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["cru", "off-white", "caramelo", "azul-jeans", "preto"] },
      { grupo: "tamanho", obrigatorio: true, valores: ["m", "g"] },
      { grupo: "forro", obrigatorio: true, valores: ["com-forro", "sem-forro"] },
      { grupo: "personalizacao", obrigatorio: false, valores: [] },
    ],
  },
  {
    slug: "bolsa-imperial-praia", name: "Bolsa Imperial de Praia", categoria: "bolsas", subcategoria: "praia",
    description: "Bolsa de praia em ponto vazado, larga e leve. Aguenta areia, sol e canga molhada.",
    price: 260, dimensions: "42 × 36 × 14 cm", material: "Barbante ecológico",
    capacity: "Cabe canga, toalha, protetor e uma garrafa de 1 litro.",
    careText: "Enxágue em água doce depois da praia e seque à sombra.",
    diasMin: 7, diasMax: 12,
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["cru", "mostarda", "terracota", "azul-jeans"] },
      { grupo: "alca", obrigatorio: true, valores: ["de-mao", "transversal-ajustavel"] },
    ],
  },
  {
    slug: "necessaire-petropolis", name: "Necessaire Petrópolis", categoria: "bolsas", subcategoria: "necessaire",
    description: "Necessaire de cordão para maquiagem, crochê de viagem ou o que você quiser guardar junto.",
    price: 85, dimensions: "20 × 15 cm", material: "Fio de malha de algodão",
    capacity: "Cabe o essencial de maquiagem ou um novelo com agulhas.",
    careText: "Lave à mão em água fria com sabão neutro.",
    diasMin: 4, diasMax: 7, destaque: 2,
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["cru", "rosa-antigo", "verde-musgo", "mostarda"] },
      { grupo: "personalizacao", obrigatorio: false, valores: [] },
    ],
  },
  {
    slug: "jogo-americano-trancado", name: "Jogo Americano Trançado", categoria: "mesa-posta",
    description: "Jogo americano em ponto trançado, que dá relevo à mesa sem desequilibrar o prato.",
    price: 45, dimensions: "45 × 33 cm (cada peça)", material: "Barbante de algodão nº 6",
    careText: "Máquina em ciclo delicado, dentro de saquinho. Não use alvejante.",
    diasMin: 5, diasMax: 10, destaque: 3,
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["cru", "off-white", "terracota", "verde-musgo", "mostarda"] },
    ],
  },
  {
    slug: "porta-copos-ponto-alto", name: "Porta-copos Ponto Alto", categoria: "mesa-posta",
    description: "Conjunto de porta-copos em ponto alto, grosso o bastante para segurar a umidade do copo gelado.",
    price: 60, dimensions: "11 cm de diâmetro", material: "Barbante de algodão nº 6",
    careText: "Lave à mão e seque no varal.",
    diasMin: 3, diasMax: 6,
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["cru", "terracota", "verde-musgo", "azul-jeans"] },
    ],
  },
  {
    slug: "manta-petropolis", name: "Manta Petrópolis", categoria: "casa-decoracao",
    description: "Manta de sofá em ponto grosso, pensada para o frio da serra. Pesada na medida certa.",
    price: null, dimensions: "1,60 × 1,20 m", material: "Fio grosso de algodão",
    careText: "Lave à mão ou em ciclo delicado. Seque deitada, nunca pendurada.",
    diasMin: 20, diasMax: 30,
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["cru", "off-white", "caramelo", "verde-musgo"] },
      { grupo: "tamanho", obrigatorio: true, valores: ["m", "g"] },
    ],
  },
  {
    slug: "suporte-planta-cascata", name: "Suporte de Planta Cascata", categoria: "macrame",
    description: "Suporte de macramê para vaso pendurado, com franja longa. Os nós são dados um a um.",
    price: 95, dimensions: "90 cm de comprimento", material: "Corda de algodão 4 mm",
    careText: "Limpe com pano levemente úmido. Não molhe a corda.",
    diasMin: 5, diasMax: 8,
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["cru", "off-white", "caramelo"] },
      { grupo: "tamanho", obrigatorio: true, valores: ["p", "m", "g"] },
    ],
  },
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
      aboutText:
        "Sou a Raquel. Faço crochê e macramê em Petrópolis, na serra do Rio, e cada peça que sai daqui foi feita à mão, uma de cada vez.",
      announcementText: null,
      announcementActive: false,
    },
  });

  for (const c of CATEGORIAS) {
    await db.category.upsert({ where: { slug: c.slug }, update: c, create: c });
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

  const [cat, sub, prod, grp, val] = await Promise.all([
    db.category.count(), db.subcategory.count(), db.product.count(),
    db.optionGroup.count(), db.optionValue.count(),
  ]);
  console.log(
    `Seed: ${cat} categorias, ${sub} subcategorias de bolsa, ${prod} produtos, ` +
    `${grp} grupos de opção com ${val} valores.`
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
