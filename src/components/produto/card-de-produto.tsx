import Link from "next/link";
import { Foto } from "@/components/ui/foto";
import { Preco } from "@/components/ui/preco";
import type { ProdutoResumo } from "@/lib/queries/tipos";

/**
 * O card é um link só, e o estilo de estado mora no `<a>` — não no `<article>`.
 *
 * Não é detalhe de organização: o Safari do iPhone só aplica `:active` de forma
 * confiável em elemento clicável, e é justamente no celular que o card precisa
 * responder — o `hover:` do Tailwind v4 vive atrás de `@media (hover: hover)` e
 * simplesmente não existe para quem chega pelo Instagram. Sem isso o elemento
 * mais repetido do site era o único que não dava retorno nenhum ao toque.
 *
 * O desenho dos estados (subir 2px, `--shadow-peca`, 180ms, e afundar sob o
 * dedo) está em `.card-peca`, no `globals.css`. A foto continua sem zoom, por
 * decisão da identidade §7.1.
 */
export function CardDeProduto({
  produto,
  prioridade = false,
}: {
  produto: ProdutoResumo;
  prioridade?: boolean;
}) {
  return (
    <article className="h-full">
      <Link
        href={`/produtos/${produto.slug}`}
        className="card-peca block h-full rounded-card border border-borda bg-superficie p-card"
      >
        {/* A placa: a peça precisa pousar em alguma coisa. Ver `.placa-da-peca`
            no `globals.css` — o porquê está lá. */}
        <div className="placa-da-peca">
          <Foto
            imagem={produto.capa}
            arco={produto.ehBolsa}
            dentroDeCard
            prioridade={prioridade}
          />
        </div>
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
