/**
 * Renderiza o texto longo da categoria — o conteúdo indexável que a Raquel
 * edita no admin.
 *
 * Markdown deliberadamente mínimo: parágrafo separado por linha em branco,
 * `## ` para subtítulo e `**negrito**`. Não uso uma biblioteca porque isso
 * viraria uma porta para HTML arbitrário vindo do banco; aqui nada é
 * interpretado como marcação além dessas três formas, e o React já escapa o
 * texto.
 */
export function comNegrito(texto: string): React.ReactNode[] {
  // O split com grupo de captura devolve, alternadamente, texto solto e o
  // conteúdo entre os asteriscos — os índices ímpares são os negritos.
  return texto.split(/\*\*(.+?)\*\*/g).map((parte, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-medium">
        {parte}
      </strong>
    ) : (
      parte
    )
  );
}

/**
 * Quebra o texto em blocos. Aceita `\r\n` além de `\n`: texto salvo pelo painel
 * antes da normalização chegou ao banco com CRLF, e sem isto vira um parágrafo
 * só.
 */
function blocosDoTexto(texto: string): string[] {
  return texto
    .split(/(?:\r?\n){2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
}

export type TrechoDeTexto = {
  /** `null` só no trecho de abertura, antes do primeiro `## `. */
  titulo: string | null;
  paragrafos: string[];
};

/**
 * O mesmo texto do banco, agrupado por subtítulo.
 *
 * Existe porque nem todo texto longo quer ser uma coluna corrida. "Cuidados com
 * as peças" é uma lista de assuntos independentes — lavagem, secagem, bolsas,
 * macramê — e ler isso como um rolo de 1.400px é o oposto do que uma instrução
 * de cuidado precisa ser: ela é consultada, não lida do começo ao fim. Com os
 * trechos separados, a seção vira grade e a pessoa acha "secagem" de relance.
 *
 * A fonte continua sendo o mesmo campo do painel, com a mesma marcação. A
 * Raquel não precisa aprender nada novo: se ela escreve `## `, o assunto vira
 * ficha; se não escreve, o chamador cai na coluna corrida de sempre.
 */
export function agruparPorSubtitulo(texto: string): TrechoDeTexto[] {
  const trechos: TrechoDeTexto[] = [];

  for (const bloco of blocosDoTexto(texto)) {
    if (bloco.startsWith("## ")) {
      trechos.push({ titulo: bloco.slice(3).trim(), paragrafos: [] });
      continue;
    }
    // Parágrafo sem subtítulo antes dele: abre o trecho de abertura.
    if (trechos.length === 0) trechos.push({ titulo: null, paragrafos: [] });
    trechos[trechos.length - 1].paragrafos.push(bloco);
  }

  return trechos;
}

/**
 * O `nivel` existe porque o mesmo texto entra em dois contextos diferentes.
 *
 * Numa página inteira (`/politicas/...`) o corpo é o conteúdo principal e seus
 * `## ` são `<h2>` legítimos. Dentro de uma SEÇÃO da home, porém, já existe um
 * `<h2>` acima — "Como começou", "Cuidados com as peças" —, e emitir outros
 * `<h2>` irmãos ali achata a hierarquia: para o leitor de tela, o subtítulo do
 * texto passa a ter o mesmo peso do título da seção, e a estrutura da página
 * deixa de descrever o que está dentro de quê.
 *
 * O ramo de fichas de `cuidados.tsx` já acertava isso usando `h3`, e o
 * comentário de lá descreve exatamente este problema — faltava o outro ramo
 * poder fazer o mesmo.
 */
export function TextoLongo({ texto, nivel = 2 }: { texto: string; nivel?: 2 | 3 }) {
  const blocos = blocosDoTexto(texto);
  const Titulo = nivel === 3 ? "h3" : "h2";

  return (
    <div className="max-w-texto">
      {blocos.map((bloco, i) =>
        bloco.startsWith("## ") ? (
          <Titulo
            key={i}
            className={`font-display text-t3 ${i === 0 ? "" : "mt-respiro"}`}
          >
            {comNegrito(bloco.slice(3))}
          </Titulo>
        ) : (
          <p key={i} className="mt-4 text-leitura">
            {comNegrito(bloco)}
          </p>
        )
      )}
    </div>
  );
}
