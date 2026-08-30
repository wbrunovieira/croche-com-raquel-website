import Link from "next/link";
import { Foto } from "@/components/ui/foto";
import { Preco } from "@/components/ui/preco";
import type { ProdutoResumo } from "@/lib/queries/tipos";

export function CardDeProduto({
  produto,
  prioridade = false,
}: {
  produto: ProdutoResumo;
  prioridade?: boolean;
}) {
  return (
    <article className="group rounded-card border border-borda bg-superficie p-card transition-shadow hover:shadow-peca">
      <Link href={`/produtos/${produto.slug}`} className="block">
        <Foto
          imagem={produto.capa}
          arco={produto.ehBolsa}
          dentroDeCard
          prioridade={prioridade}
        />
        <p className="mt-3 text-etiqueta uppercase text-conteudo-suave">
          {produto.subcategoria?.nome ?? produto.categoria.nome}
        </p>
        <h3 className="mt-1 font-display text-lead leading-tight">{produto.nome}</h3>
        <p className="mt-1 text-apoio">
          <Preco valor={produto.preco} />
        </p>
      </Link>
    </article>
  );
}

export function GradeDeProdutos({
  produtos,
  vazio = "Nenhuma peça por aqui ainda.",
}: {
  produtos: ProdutoResumo[];
  vazio?: string;
}) {
  if (produtos.length === 0) {
    return <p className="text-conteudo-suave">{vazio}</p>;
  }
  return (
    <div className="grade-catalogo">
      {produtos.map((p, i) => (
        <CardDeProduto key={p.id} produto={p} prioridade={i < 4} />
      ))}
    </div>
  );
}
