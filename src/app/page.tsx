import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-medida flex-1 place-items-center px-6 py-24">
      <div className="max-w-texto text-center">
        <span className="font-texto text-etiqueta uppercase text-conteudo-suave">
          Petrópolis, RJ
        </span>
        <h1 className="mt-4 font-display text-t1">Crochê com Raquel</h1>
        <p className="mt-4 text-lead text-conteudo-suave">
          Bolsas, mesa posta e decoração em crochê e macramê, feitas à mão sob
          encomenda.
        </p>
        <div className="corrente mt-10" aria-hidden="true" />
        <p className="mt-respiro">
          <Link
            href="/bolsas"
            className="inline-flex items-center justify-center rounded-fio bg-primaria px-btn-x py-btn-y font-medium text-sobre-primaria transition-colors hover:bg-primaria-hover"
          >
            Ver as bolsas
          </Link>
        </p>
        <p className="mt-bloco text-apoio text-conteudo-suave">
          Home completa na etapa 7.{" "}
          <Link href="/estilo" className="text-destaque-texto underline underline-offset-4">
            Ver a amostra da identidade
          </Link>
        </p>
      </div>
    </main>
  );
}
