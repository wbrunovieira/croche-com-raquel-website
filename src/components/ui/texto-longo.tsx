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
function comNegrito(texto: string): React.ReactNode[] {
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

export function TextoLongo({ texto }: { texto: string }) {
  const blocos = texto
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="max-w-texto">
      {blocos.map((bloco, i) =>
        bloco.startsWith("## ") ? (
          <h2
            key={i}
            className={`font-display text-t3 ${i === 0 ? "" : "mt-respiro"}`}
          >
            {comNegrito(bloco.slice(3))}
          </h2>
        ) : (
          <p key={i} className="mt-4 text-leitura">
            {comNegrito(bloco)}
          </p>
        )
      )}
    </div>
  );
}
