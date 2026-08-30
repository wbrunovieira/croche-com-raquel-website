/** Eyebrow — nível N6 da hierarquia. Rotula o que vem logo abaixo. */
export function Etiqueta({
  children,
  className = "",
  tom = "claro",
}: {
  children: React.ReactNode;
  className?: string;
  tom?: "claro" | "invertido";
}) {
  const cor = tom === "invertido" ? "text-inv-suave" : "text-conteudo-suave";
  return (
    <span className={`font-texto text-etiqueta uppercase ${cor} ${className}`}>
      {children}
    </span>
  );
}
