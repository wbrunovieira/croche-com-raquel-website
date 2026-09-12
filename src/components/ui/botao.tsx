import Link from "next/link";

export type VarianteDeBotao = "primaria" | "secundaria" | "texto" | "zap" | "clara";
export type TamanhoDeBotao = "sm" | "md" | "lg";

const VARIANTES: Record<VarianteDeBotao, string> = {
  // A cor e a sombra moram em `.botao-primario` (globals.css): utilitário
  // vence camada de componente, então deixar `bg-primaria` aqui apagaria o
  // brilho e o degradê de lá.
  primaria: "botao-primario text-sobre-primaria rounded-fio",
  // Cor, borda e sombra moram em `.botao-secundario` (globals.css) — mesma
  // razão do primário: utilitário vence camada de componente.
  secundaria: "botao-secundario text-conteudo rounded-fio",
  // Fundo claro sobre as seções verdes.
  clara: "bg-cru text-verde-cristal hover:bg-papel rounded-fio",
  // Único lugar do site com o verde-médio: o flutuante do mobile.
  zap: "bg-zap text-white hover:bg-zap-escuro rounded-pilula shadow-zap",
  texto:
    "text-destaque-texto underline underline-offset-4 hover:no-underline",
};

// O botão de texto ganha py-2 -my-2: sem isso a área de toque fica em 21px, e
// a WCAG 2.5.5 pede 44. O -my-2 devolve o espaço para o layout.
const TAMANHOS: Record<TamanhoDeBotao, string> = {
  sm: "px-btn-sm-x py-btn-sm-y text-apoio gap-2",
  md: "px-btn-x py-btn-y gap-btn-icone",
  lg: "px-btn-lg-x py-btn-lg-y text-leitura gap-btn-icone",
};

export function classesDeBotao(
  variante: VarianteDeBotao = "primaria",
  tamanho: TamanhoDeBotao = "md"
) {
  // `active:translate-y-px` é a identidade §7.3 — e é o único retorno de toque
  // que existe no celular, onde o `hover:` do Tailwind v4 nem chega a valer
  // (ele mora atrás de `@media (hover: hover)`). `disabled:active` volta a zero
  // para o botão desabilitado não fingir que respondeu.
  const base =
    "inline-flex items-center justify-center font-texto font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-[240ms] ease-fio active:translate-y-px disabled:active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed";
  if (variante === "texto") return `${base} py-2 -my-2 ${VARIANTES.texto}`;
  return `${base} ${VARIANTES[variante]} ${TAMANHOS[tamanho]}`;
}

type PropsComuns = {
  variante?: VarianteDeBotao;
  tamanho?: TamanhoDeBotao;
  className?: string;
  children: React.ReactNode;
};

export function Botao({
  variante,
  tamanho,
  className = "",
  ...props
}: PropsComuns & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${classesDeBotao(variante, tamanho)} ${className}`} {...props} />;
}

export function BotaoLink({
  variante,
  tamanho,
  className = "",
  href,
  externo = false,
  children,
}: PropsComuns & { href: string; externo?: boolean }) {
  const classes = `${classesDeBotao(variante, tamanho)} ${className}`;
  if (externo) {
    return (
      <a className={classes} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link className={classes} href={href}>
      {children}
    </Link>
  );
}
