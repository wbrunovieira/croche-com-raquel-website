export function Chip({
  children,
  tom = "destaque",
}: {
  children: React.ReactNode;
  tom?: "destaque" | "neutro";
}) {
  const cores =
    tom === "destaque"
      ? "bg-goiaba-clara text-conteudo"
      : "bg-superficie-baixa text-conteudo-suave";
  return (
    <span
      className={`inline-block rounded-fio px-chip-x py-chip-y text-etiqueta uppercase ${cores}`}
    >
      {children}
    </span>
  );
}
