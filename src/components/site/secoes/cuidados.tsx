import { Etiqueta } from "@/components/ui/etiqueta";
import { Revelar } from "@/components/ui/revelar";
import { TextoLongo, agruparPorSubtitulo, comNegrito } from "@/components/ui/texto-longo";
import type { PaginaInstitucional } from "@/lib/queries/paginas";

/**
 * Cuidados com a peça. O texto vem do banco: é ela quem sabe, e muda.
 *
 * **É a virada de superfície da página.** Daqui até o rodapé o assunto deixa de
 * ser escolha (catálogo, filtros, comparação) e passa a ser conversa: quem faz,
 * como cuidar, o que costumam perguntar, como encomendar. A faixa verde marca
 * essa virada — é a mesma inversão cromática que abre o site, agora fechando
 * o miolo.
 *
 * Três coisas separam esta faixa das outras faixas verdes:
 *
 * 1. **A luz.** `.luz-de-janela` é exclusiva daqui (ver `globals.css`): é a
 *    faixa escura mais longa do site e, chapada, ela lê como um bloco só.
 * 2. **A costura no alto.** A `corrente` marca a emenda entre a superfície
 *    clara e a escura, e se costura da esquerda para a direita quando a seção
 *    entra. É o mesmo ornamento que fecha o hero, no papel de sempre: dividir.
 * 3. **A geometria.** O cabeçalho é centrado — e é o único centrado do site
 *    inteiro. Nada mais aqui é "coluna única à esquerda".
 *
 * E o corpo deixa de ser coluna corrida: cada assunto do texto (`## ` no
 * painel) vira uma ficha da grade. Instrução de cuidado é consultada, não lida
 * de cabo a rabo — a cliente quer achar "secagem" de relance, com a peça
 * molhada na mão. Se a Raquel apagar os subtítulos, cai na coluna de sempre.
 */
export function SecaoCuidados({ pagina }: { pagina: PaginaInstitucional | null }) {
  if (!pagina) return null;

  const trechos = agruparPorSubtitulo(pagina.corpo);
  const abertura = trechos.find((t) => t.titulo === null);
  const fichas = trechos.filter((t) => t.titulo !== null);
  // Duas fichas é o mínimo para existir grade. Com menos que isso — ou com um
  // texto que nunca usou subtítulo — a seção continua sendo uma coluna de
  // leitura, que é o que ela sempre foi.
  const emFichas = fichas.length >= 2;

  return (
    <section
      id="cuidados"
      className="trama luz-de-janela relative scroll-mt-cabecalho-lg bg-inv-fundo text-inv-conteudo"
    >
      {/* A emenda entre o claro e o escuro. `decorativo` tira do leitor de tela:
          é ornamento, não conteúdo. */}
      <Revelar
        decorativo
        className="corrente corrente--claro absolute inset-x-0 top-0"
      />

      {/* `secao--ampla`, com DOIS traços — superfície escura comprime
          opticamente e o padding de faixa invertida sobe um degrau (§3.3 do
          sistema de espaçamento). Com um traço só a classe não existe e o
          padding some em silêncio. */}
      <div className="container-site secao--ampla">
        <Revelar entrada="ponto" className="mx-auto max-w-texto text-center">
          <Etiqueta tom="invertido">Cuidados</Etiqueta>
          <h2 className="mt-2 font-display text-t2">{pagina.titulo}</h2>
          {pagina.chamada ? (
            <p className="mt-4 text-lead text-inv-suave">{pagina.chamada}</p>
          ) : null}
        </Revelar>

        {abertura ? (
          <Revelar entrada="texto" atraso={0.08} className="mx-auto mt-bloco max-w-texto">
            {abertura.paragrafos.map((paragrafo, i) => (
              <p
                key={i}
                className={`text-leitura text-inv-suave ${i > 0 ? "mt-4" : ""}`}
              >
                {comNegrito(paragrafo)}
              </p>
            ))}
          </Revelar>
        ) : null}

        {emFichas ? (
          /* `ponto` porque quem entra em cascata são os FILHOS, um por vez, e o
             desenho já trava o atraso a partir do quarto: seis fichas chegam em
             três tempos, não em seis. Um observador só para a grade inteira —
             nada de observador por ficha. */
          <Revelar
            entrada="ponto"
            className="mt-respiro grid gap-x-coluna gap-y-grade-linha md:grid-cols-2"
          >
            {fichas.map((ficha) => (
              <div key={ficha.titulo} className="border-t border-inv-borda pt-6">
                {/* `h3`: são subassuntos do `h2` da seção. No corpo corrido o
                    painel gera `h2`, o que aqui deixaria a seção com sete `h2`
                    irmãos e nenhuma hierarquia para o buscador ler. */}
                <h3 className="font-display text-t3">{ficha.titulo}</h3>
                {ficha.paragrafos.map((paragrafo, i) => (
                  <p key={i} className="mt-4 text-leitura text-inv-suave">
                    {comNegrito(paragrafo)}
                  </p>
                ))}
              </div>
            ))}
          </Revelar>
        ) : (
          <Revelar entrada="texto" className="mx-auto mt-respiro max-w-texto">
            <TextoLongo texto={pagina.corpo} />
          </Revelar>
        )}
      </div>
    </section>
  );
}
