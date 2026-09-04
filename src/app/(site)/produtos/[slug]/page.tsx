import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip } from "@/components/ui/chip";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Preco } from "@/components/ui/preco";
import { Galeria } from "@/components/produto/galeria";
import { Pedido } from "@/components/produto/pedido";
import { Compartilhar } from "@/components/produto/compartilhar";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { formatarPrazo } from "@/lib/formatar";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import {
  buscarProdutoPorSlug,
  listarRelacionados,
  listarSlugsDeProduto,
} from "@/lib/queries/produtos";
import { urlDoProduto } from "@/lib/site";
import {
  DadosEstruturados,
  produtoEstruturado,
  trilha,
} from "@/components/seo/dados-estruturados";

export async function generateStaticParams() {
  const slugs = await listarSlugsDeProduto();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/produtos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const produto = await buscarProdutoPorSlug(slug);
  if (!produto) return { title: "Peça não encontrada" };

  return {
    title: produto.nome,
    description: produto.descricao.slice(0, 160),
    alternates: { canonical: `/produtos/${produto.slug}` },
    openGraph: {
      title: `${produto.nome} · Crochê com Raquel`,
      description: produto.descricao.slice(0, 200),
      url: urlDoProduto(produto.slug),
      type: "website",
    },
  };
}

export default async function PaginaDeProduto({ params }: PageProps<"/produtos/[slug]">) {
  const { slug } = await params;
  const produto = await buscarProdutoPorSlug(slug);
  if (!produto) notFound();

  const [config, relacionados] = await Promise.all([
    buscarConfiguracoes(),
    listarRelacionados(produto),
  ]);

  const prazo = formatarPrazo(produto.prazoMinDias, produto.prazoMaxDias);
  const url = urlDoProduto(produto.slug);
  const linkDaCategoria =
    produto.categoria.slug === "bolsas"
      ? "/bolsas"
      : `/?categoria=${produto.categoria.slug}#catalogo`;

  const cores =
    produto.grupos.find((g) => g.slug === "cor")?.valores.map((v) => v.nome) ?? [];

  return (
    <main className="container-site secao">
      <DadosEstruturados
        dados={produtoEstruturado({
          nome: produto.nome,
          slug: produto.slug,
          descricao: produto.descricao,
          preco: produto.preco,
          material: produto.material,
          imagens: produto.imagens.map((i) => i.url),
          categoria: produto.categoria.nome,
          cores,
        })}
      />
      <DadosEstruturados
        dados={trilha([
          { nome: "Início", caminho: "/" },
          { nome: produto.categoria.nome, caminho: linkDaCategoria },
          { nome: produto.nome, caminho: `/produtos/${produto.slug}` },
        ])}
      />
      <nav aria-label="Trilha" className="text-apoio text-conteudo-suave">
        <ol className="flex flex-wrap items-center gap-x-2">
          <li>
            <Link href="/" className="hover:text-conteudo">
              Início
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={linkDaCategoria} className="hover:text-conteudo">
              {produto.categoria.nome}
            </Link>
          </li>
          {produto.subcategoria ? (
            <>
              <li aria-hidden="true">/</li>
              <li>{produto.subcategoria.nome}</li>
            </>
          ) : null}
        </ol>
      </nav>

      <div className="mt-bloco grid gap-x-coluna gap-y-grade-linha lg:grid-cols-2">
        <div>
          <Galeria
            imagens={produto.imagens}
            arco={produto.ehBolsa}
            nomeDoProduto={produto.nome}
          />
        </div>

        <div>
          <Etiqueta>{produto.subcategoria?.nome ?? produto.categoria.nome}</Etiqueta>
          <h1 className="mt-2 font-display text-t1">{produto.nome}</h1>

          <p className="mt-3 text-lead">
            <Preco valor={produto.preco} />
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Chip>Sob encomenda</Chip>
            {prazo ? <span className="text-apoio text-conteudo-suave">{prazo}</span> : null}
          </div>

          <p className="mt-bloco max-w-texto text-leitura">{produto.descricao}</p>

          {produto.capacidade ? (
            <p className="mt-4 max-w-texto text-base text-conteudo-suave">
              {produto.capacidade}
            </p>
          ) : null}

          <div className="mt-bloco border-t border-borda pt-6">
            <Pedido
              nomeDoProduto={produto.nome}
              slugDoProduto={produto.slug}
              grupos={produto.grupos}
              numeroDoWhatsapp={config.whatsappNumero}
              template={config.whatsappTemplate}
              urlDaPagina={url}
            />
          </div>

          <div className="mt-bloco">
            <Compartilhar url={url} titulo={`${produto.nome} · Crochê com Raquel`} />
          </div>
        </div>
      </div>

      <div className="mt-respiro grid gap-x-coluna gap-y-grade-linha lg:grid-cols-2">
        <FichaTecnica
          itens={[
            { rotulo: "Medidas", valor: produto.medidas },
            { rotulo: "Material", valor: produto.material },
            { rotulo: "Prazo de produção", valor: prazo },
          ]}
        />
        {produto.cuidados ? (
          <div>
            <h2 className="font-display text-t3">Cuidados com a peça</h2>
            <p className="mt-4 max-w-texto text-leitura">{produto.cuidados}</p>
          </div>
        ) : null}
      </div>

      {relacionados.length > 0 ? (
        <section className="mt-respiro">
          <h2 className="font-display text-t2">Combina com</h2>
          <div className="mt-bloco">
            <GradeDeProdutos produtos={relacionados} />
          </div>
        </section>
      ) : null}
    </main>
  );
}

function FichaTecnica({
  itens,
}: {
  itens: { rotulo: string; valor: string | null }[];
}) {
  const preenchidos = itens.filter((i) => i.valor);
  if (preenchidos.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-t3">Ficha da peça</h2>
      <dl className="mt-4 space-y-3">
        {preenchidos.map((i) => (
          <div key={i.rotulo} className="flex flex-wrap gap-x-3 border-b border-borda/60 pb-3">
            <dt className="min-w-40 text-apoio text-conteudo-suave">{i.rotulo}</dt>
            <dd className="text-base">{i.valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
