/**
 * Catálogo inicial da Raquel.
 *
 * Mora fora do `seed.ts` porque duas coisas precisam dele: o seed, que grava
 * os dados, e o `scripts/importar-fotos.ts`, que sobe as fotos ao Blob. Se
 * cada um tivesse a sua cópia da lista, uma hora as duas discordariam.
 */

export type Opcao = { grupo: string; obrigatorio: boolean; valores: string[] };

/// Foto da peça em `prisma/fotos/`. O arquivo entra no Blob por
/// `pnpm fotos:importar` — o seed não sobe binário, só grava dados.
export type Foto = { arquivo: string; alt: string; escalaHumana?: boolean };

/**
 * Catálogo inicial: **peças reais da Raquel**, descritas a partir das fotos do
 * @croche.comraquel.
 *
 * Preço, medidas, capacidade e prazo ficam **nulos de propósito**. São
 * compromissos que só ela pode assumir, e chutar um número aqui viraria
 * promessa no site. A UI já trata: preço nulo aparece como "sob consulta".
 * Ela preenche no painel.
 *
 * Descrição e material vêm do que a foto mostra — ponto, alça, fecho,
 * acabamento. Nada aqui afirma o que não dá para ver.
 */
export const PRODUTOS: {
  slug: string; name: string; description: string; price: number | null;
  categoria: string; subcategoria?: string;
  dimensions?: string; material?: string; capacity?: string; careText?: string;
  diasMin?: number; diasMax?: number;
  destaque?: number; opcoes: Opcao[]; fotos: Foto[];
}[] = [
  {
    slug: "bolsa-transversal-caramelo", name: "Bolsa Transversal Caramelo",
    categoria: "bolsas", subcategoria: "transversal",
    description: "Transversal pequena em ponto vazado, com alça longa de crochê presa por argolas metálicas. O corpo fecha na base e abre no meio — leve, para andar de mãos livres com o essencial.",
    price: null, material: "Fio de algodão",
    careText: "Lave à mão em água fria com sabão neutro. Seque à sombra, deitada.",
    destaque: 0,
    fotos: [{ arquivo: "bolsa-transversal-caramelo.jpg", alt: "Bolsa transversal de crochê em caramelo, com alça longa e etiqueta de couro, sobre mesa branca" }],
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["caramelo", "cru", "terracota", "verde-musgo", "preto"] },
      { grupo: "alca", obrigatorio: true, valores: ["transversal-ajustavel", "de-couro"] },
      { grupo: "forro", obrigatorio: true, valores: ["com-forro", "sem-forro"] },
      { grupo: "personalizacao", obrigatorio: false, valores: [] },
    ],
  },
  {
    slug: "bolsa-saco-cafe", name: "Bolsa Saco Café",
    categoria: "bolsas", subcategoria: "tote",
    description: "Bolsa de ombro em ponto baixo fechado, firme, com alças de couro presas por mosquetões dourados. Fecha por cordão de crochê com contas de madeira nas pontas.",
    price: null, material: "Fio de algodão, alças de couro",
    careText: "Lave à mão em água fria. Solte as alças de couro antes — couro não vai à água.",
    destaque: 1,
    fotos: [{ arquivo: "bolsa-saco-cafe.jpg", alt: "Bolsa saco de crochê marrom-café com alças de couro e cordão com contas de madeira, segurada na mão", escalaHumana: true }],
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["cafe", "preto", "caramelo", "terracota", "cru"] },
      { grupo: "alca", obrigatorio: true, valores: ["de-couro", "corrente"] },
      { grupo: "forro", obrigatorio: true, valores: ["com-forro", "sem-forro"] },
      { grupo: "fecho", obrigatorio: true, valores: ["cordao", "ziper"] },
    ],
  },
  {
    slug: "bolsa-ombro-bordo", name: "Bolsa de Ombro Bordô",
    categoria: "bolsas", subcategoria: "tote",
    description: "Bolsa de ombro de boca larga e alça única, em ponto baixo trabalhado em fileiras. Cai macia no corpo e acomoda o que você puser dentro sem perder o caimento.",
    price: null, material: "Fio de algodão",
    careText: "Lave à mão em água fria. Não torça — pressione para tirar o excesso de água e seque deitada.",
    destaque: 2,
    fotos: [{ arquivo: "bolsa-ombro-bordo.jpg", alt: "Bolsa de ombro de crochê na cor bordô, com alça única, pendurada em uma cadeira" }],
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["vinho", "preto", "cru", "verde-musgo", "caramelo"] },
      { grupo: "tamanho", obrigatorio: true, valores: ["m", "g"] },
      { grupo: "forro", obrigatorio: true, valores: ["com-forro", "sem-forro"] },
    ],
  },
  {
    slug: "bolsa-saco-terracota", name: "Bolsa Saco Terracota",
    categoria: "bolsas", subcategoria: "transversal",
    description: "Bolsa saco em dois pontos — o corpo texturizado e a base fechada — com alça longa trançada, cordão de contas de madeira e tassel de franja na frente.",
    price: null, material: "Fio de algodão",
    careText: "Lave à mão em água fria com sabão neutro. Seque à sombra, deitada.",
    destaque: 3,
    fotos: [{ arquivo: "bolsa-saco-terracota.jpg", alt: "Bolsa saco de crochê terracota com tassel de franja, sendo usada a tiracolo", escalaHumana: true }],
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["terracota", "caramelo", "cafe", "mostarda"] },
      { grupo: "forro", obrigatorio: true, valores: ["com-forro", "sem-forro"] },
      { grupo: "personalizacao", obrigatorio: false, valores: [] },
    ],
  },
  {
    slug: "sousplat-folhas", name: "Sousplat de Folhas",
    categoria: "mesa-posta",
    description: "Sousplat redondo em duas cores, com a borda desenhada em folhas. Fica firme na mesa e não enruga sob o prato.",
    price: null, material: "Barbante de algodão",
    careText: "Máquina em ciclo delicado, dentro de saquinho. Não use alvejante.",
    destaque: 4,
    fotos: [{ arquivo: "sousplat-verde-cru.jpg", alt: "Sousplat de crochê em verde e cru com borda em folhas, com xícara e pires brancos por cima" }],
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["verde-musgo", "cru", "terracota", "off-white"] },
    ],
  },
  {
    slug: "jogo-mandala-mesa", name: "Jogo de Sousplat e Porta-copos",
    categoria: "mesa-posta",
    description: "Jogo de mesa em mandala: as voltas alternam as duas cores do centro para a borda, e o porta-copos repete o mesmo desenho em escala menor.",
    price: null, material: "Barbante de algodão",
    careText: "Máquina em ciclo delicado, dentro de saquinho. Não use alvejante.",
    fotos: [{ arquivo: "mesa-posta-verde-cru.jpg", alt: "Mesa posta com sousplats e porta-copos de crochê em mandala verde e cru, com taças de vidro" }],
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["verde-musgo", "cru", "terracota", "azul-jeans"] },
    ],
  },
  {
    slug: "centro-de-mesa-rendado", name: "Centro de Mesa Rendado",
    categoria: "mesa-posta",
    description: "Toalha redonda de centro em ponto rendado, com borda em bico e o contorno em cor contrastante. Vai sozinha sobre a madeira ou sob o arranjo.",
    price: null, material: "Linha de algodão",
    careText: "Lave à mão em água fria. Seque deitada, esticada, para o bico não encolher.",
    fotos: [{ arquivo: "centro-de-mesa-cru.jpg", alt: "Centro de mesa redondo de crochê cru com borda verde, sobre mesa de madeira, com arranjo de flores" }],
    opcoes: [
      { grupo: "cor", obrigatorio: true, valores: ["cru", "off-white", "verde-musgo"] },
    ],
  },
];

/**
 * Peças de exemplo das primeiras etapas, agora substituídas pelas reais.
 *
 * A lista é explícita, e não "apague tudo que não está em PRODUTOS": um dia a
 * Raquel vai cadastrar peça pelo painel, e um seed que varre o que não
 * conhece apagaria o trabalho dela.
 */
export const DEMONSTRACOES_ANTIGAS = [
  "bolsa-serra", "bolsa-cristal", "bolsa-imperial-praia", "necessaire-petropolis",
  "jogo-americano-trancado", "porta-copos-ponto-alto", "manta-petropolis",
  "suporte-planta-cascata",
];
