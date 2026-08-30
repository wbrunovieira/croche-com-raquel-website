/**
 * Tipos de domínio.
 *
 * As páginas nunca recebem um objeto do Prisma direto: `Decimal` e `Date` não
 * atravessam a fronteira para um componente de cliente, e a forma do banco não
 * é a forma que a tela quer. Tudo que sai daqui é serializável e já traduzido.
 */

export type TipoDeOpcao = "SINGLE" | "MULTIPLE" | "TEXT";

export type ValorDeOpcao = {
  id: string;
  slug: string;
  nome: string;
  /** #RRGGBB — só no grupo de cor. Desenha a bolinha do seletor. */
  hex: string | null;
  /** Linha do fio, como na etiqueta: "Barroco Maxcolor 400g". */
  linhaDoFio: string | null;
  /** Código da cor no fabricante: "7684". É por ele que a Raquel recompra. */
  codigoDaCor: string | null;
};

export type GrupoDeOpcao = {
  id: string;
  slug: string;
  nome: string;
  tipo: TipoDeOpcao;
  obrigatorio: boolean;
  valores: ValorDeOpcao[];
};

export type ImagemDeProduto = {
  id: string;
  url: string;
  alt: string;
  /** Peça sendo usada por uma pessoa. Obrigatória em bolsa. */
  temEscalaHumana: boolean;
};

export type ProdutoResumo = {
  id: string;
  slug: string;
  nome: string;
  /** Nulo significa "sob consulta". Nunca troque por 0. */
  preco: number | null;
  categoria: { slug: string; nome: string };
  subcategoria: { slug: string; nome: string } | null;
  /** Bolsa ganha a máscara em arco; o resto, card reto. */
  ehBolsa: boolean;
  capa: ImagemDeProduto | null;
};

export type ProdutoDetalhe = ProdutoResumo & {
  descricao: string;
  medidas: string | null;
  material: string | null;
  capacidade: string | null;
  cuidados: string | null;
  prazoMinDias: number | null;
  prazoMaxDias: number | null;
  imagens: ImagemDeProduto[];
  grupos: GrupoDeOpcao[];
};

export type CategoriaResumo = {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  /** Texto longo indexável, editável no admin. Markdown simples. */
  textoLongo: string | null;
  subcategorias: { slug: string; nome: string }[];
  totalDeProdutos: number;
};

export type ConfiguracoesDoSite = {
  whatsappNumero: string;
  whatsappTemplate: string;
  instagramUrl: string | null;
  email: string | null;
  cidade: string;
  heroTitulo: string | null;
  heroSubtitulo: string | null;
  sobreTexto: string | null;
  avisoTexto: string | null;
  avisoAtivo: boolean;
};

/** O slug da categoria carro-chefe. Bolsa tem tratamento próprio no site. */
export const SLUG_BOLSAS = "bolsas";
