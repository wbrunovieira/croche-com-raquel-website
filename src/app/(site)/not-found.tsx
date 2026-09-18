import Link from "next/link";
import { classesDeBotao } from "@/components/ui/botao";

/**
 * A tela de "não achei isto".
 *
 * **Ela precisa existir porque os links dela circulam por WhatsApp.** A Raquel
 * manda `/produtos/<peça>` para as clientes, e esses links sobrevivem à peça:
 * basta ela renomear ou despublicar para o endereço antigo virar 404. Sem esta
 * tela, quem abre recebe a página padrão do Next — preta e branca, sem
 * cabeçalho, sem rodapé, sem nenhuma saída e sem nada que diga que aquilo ainda
 * é a loja dela.
 *
 * Fica dentro do `(site)`, então herda cabeçalho e rodapé: a pessoa que caiu
 * aqui continua a um clique do catálogo e a um clique da conversa.
 */
export default function NaoEncontrado() {
  return (
    <main id="topo" className="container-site secao">
      <div className="max-w-texto">
        <p className="text-etiqueta uppercase text-conteudo-suave">
          Página não encontrada
        </p>
        <h1 className="mt-3 font-display text-t1 text-conteudo">
          Esta peça saiu do site
        </h1>
        <p className="mt-bloco text-apoio text-conteudo-suave">
          Pode ser que ela tenha sido vendida, renomeada, ou que o endereço tenha
          vindo com algum caractere a mais. O catálogo inteiro continua no ar — e
          se você lembra qual peça era, me conte que eu digo se ainda dá para
          fazer.
        </p>
        <div className="mt-bloco flex flex-wrap gap-4">
          <Link href="/#catalogo" className={classesDeBotao("primaria")}>
            Ver o catálogo
          </Link>
          <Link href="/#contato" className={classesDeBotao("secundaria")}>
            Falar com a Raquel
          </Link>
        </div>
      </div>
    </main>
  );
}
