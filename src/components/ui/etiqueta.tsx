/**
 * Eyebrow — nível N6 da hierarquia. Rotula o que vem logo abaixo.
 *
 * **É aqui que o acento da marca trabalha.** Medido: a goiaba ocupava 0,04% da
 * home, porque tinha um papel só — "link" —, que é o papel de menor área que
 * existe numa tela. Uma paleta que declara um acento e o deixa em letra fina
 * sublinhada não é contida, é sub-utilizada.
 *
 * A etiqueta é o lugar certo para corrigir isso: aparece **uma vez por seção**,
 * sempre no mesmo papel ("aqui começa um assunto"), e nunca em área grande. O
 * acento ganha ritmo ao longo da página sem em momento algum disputar com as
 * fotos — que continuam sendo o único quente da tela, e são o que se veio ver.
 *
 * O tom de texto é o `goiaba-tinta`, não a goiaba pura: medido, a goiaba dá
 * 4,25:1 sobre o creme e reprovaria na WCAG para texto pequeno; o tinta dá
 * 5,64:1. No lado invertido quem passa é o rosa-fio, com 6,65:1 sobre o verde.
 *
 * O tracinho antes do texto é o mesmo `ponto-corrido` do indicador do menu.
 * Duas razões: ele dá ao acento um pouco de área de verdade, que letra fina não
 * dá, e repete o gesto de costura que é o vocabulário da casa — o mesmo desenho
 * marcando "onde você está" no menu e "onde isto começa" na página.
 */
export function Etiqueta({
  children,
  className = "",
  tom = "claro",
}: {
  children: React.ReactNode;
  className?: string;
  tom?: "claro" | "invertido";
}) {
  const cor = tom === "invertido" ? "text-inv-destaque" : "text-destaque-texto";
  return (
    <span
      className={`inline-flex items-center gap-2 font-texto text-etiqueta uppercase ${cor} ${className}`}
    >
      <span aria-hidden="true" className="ponto-corrido w-5 shrink-0" />
      {children}
    </span>
  );
}
